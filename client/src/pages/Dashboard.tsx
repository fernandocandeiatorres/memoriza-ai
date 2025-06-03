import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Calendar,
  User as UserIcon,
  Mail,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Footer from "@/components/Footer";
import Flashcard from "@/components/Flashcard";
import {
  getUserFlashcardSets,
  getFlashcardSet,
  getFlashcardsBySetId,
} from "@/lib/goBackendApi";
import { type Flashcard as FlashcardType } from "@shared/schema";

interface FlashcardSet {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}

interface FlashcardSetDetails {
  id: string;
  topic: string;
  created_at: string;
  user_id: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Simplified state management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Details view state
  const [selectedSet, setSelectedSet] = useState<FlashcardSetDetails | null>(
    null
  );
  const [selectedSetFlashcards, setSelectedSetFlashcards] = useState<
    FlashcardType[]
  >([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [lastClickedSetId, setLastClickedSetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        setUser(session.user);
        setSession(session);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, [navigate]);

  // Data fetching
  useEffect(() => {
    if (!session || !user) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);
        const data = await getUserFlashcardSets(user.id, session.access_token);
        setFlashcardSets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setFlashcardSets([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [session, user]);

  // Simplified handlers with debounce
  const handleFlashcardSetClick = async (setId: string) => {
    if (!session || detailsLoading) return;

    // Prevent double-clicking the same set
    if (lastClickedSetId === setId && detailsLoading) {
      console.log("Preventing duplicate click for set:", setId);
      return;
    }

    // Find the flashcard set in our existing data
    const flashcardSet = flashcardSets.find((set) => set.id === setId);
    if (!flashcardSet) {
      toast({
        title: "Erro",
        description: "Conjunto de flashcards não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDetailsLoading(true);
      setLastClickedSetId(setId);

      // Clear any previous state first
      setSelectedSet(null);
      setSelectedSetFlashcards([]);
      setCurrentCardIndex(0);

      console.log("Fetching flashcards for set:", setId);

      // Add a small delay to ensure backend state is clean
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Only fetch the flashcards - we already have the set data
      const flashcardsData = await getFlashcardsBySetId(
        setId,
        session.access_token
      );

      console.log("Flashcards data received:", flashcardsData);

      if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
        throw new Error("No flashcards found for this set");
      }

      // Use the existing flashcard set data from the list
      setSelectedSet({
        id: flashcardSet.id,
        topic: flashcardSet.topic,
        created_at: flashcardSet.created_at,
        user_id: flashcardSet.user_id,
      } as FlashcardSetDetails);

      setSelectedSetFlashcards(flashcardsData);
      setCurrentCardIndex(0);
    } catch (error) {
      console.error("Error fetching flashcards:", error);

      // Clear state on error
      setSelectedSet(null);
      setSelectedSetFlashcards([]);
      setCurrentCardIndex(0);

      toast({
        title: "Erro",
        description:
          "Não foi possível carregar os flashcards. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
      // Clear the last clicked ID after a delay
      setTimeout(() => setLastClickedSetId(null), 1000);
    }
  };

  const handleBackToDashboard = () => {
    console.log("Clearing flashcard set state and returning to dashboard");

    // Clear all related state
    setSelectedSet(null);
    setSelectedSetFlashcards([]);
    setCurrentCardIndex(0);
    setDetailsLoading(false);
    setLastClickedSetId(null);

    // Force a re-fetch of the flashcard sets to ensure fresh data
    if (session && user) {
      const refetchData = async () => {
        try {
          setDataLoading(true);
          // Add a delay to ensure backend cleanup
          await new Promise((resolve) => setTimeout(resolve, 200));
          const data = await getUserFlashcardSets(
            user.id,
            session.access_token
          );
          setFlashcardSets(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error refreshing flashcard sets:", error);
        } finally {
          setDataLoading(false);
        }
      };
      refetchData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  // Details view
  if (selectedSet && selectedSetFlashcards.length > 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedSet.topic}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedSetFlashcards.length} flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Criado em {formatDateTime(selectedSet.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Viewer */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Estudar Flashcards
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {currentCardIndex + 1} de {selectedSetFlashcards.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCardIndex(0)}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <Flashcard
                  card={selectedSetFlashcards[currentCardIndex]}
                  index={currentCardIndex}
                  totalCards={selectedSetFlashcards.length}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                  }
                  disabled={currentCardIndex === 0}
                >
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {selectedSetFlashcards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCardIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentCardIndex
                          ? "bg-primary"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentCardIndex(
                      Math.min(
                        selectedSetFlashcards.length - 1,
                        currentCardIndex + 1
                      )
                    )
                  }
                  disabled={
                    currentCardIndex === selectedSetFlashcards.length - 1
                  }
                >
                  Próximo
                </Button>
              </div>
            </div>
          </div>

          {/* All Flashcards List */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Todos os Flashcards
            </h2>
            <div className="space-y-4">
              {selectedSetFlashcards.map((flashcard, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">
                      Flashcard {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Pergunta:
                        </h4>
                        <p className="text-gray-700">{flashcard.question}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Resposta:
                        </h4>
                        <div
                          className="text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: flashcard.answer }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.email || "")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user.user_metadata?.full_name || "Usuário"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4" />
                  <span>Membro desde {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{flashcardSets.length} conjuntos criados</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcard Sets Section */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meus Flashcard Sets
              </h1>
              <p className="text-gray-600">
                Gerencie e revise seus conjuntos de flashcards criados.
              </p>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Filtrar por tópico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            {dataLoading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Carregando flashcard sets...
                  </h3>
                </CardContent>
              </Card>
            ) : flashcardSets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum conjunto de flashcards encontrado
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Você ainda não criou nenhum conjunto de flashcards.
                  </p>
                  <Button
                    onClick={() => navigate("/generator")}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    🧠 Criar Meu Primeiro Flashcard Set
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {flashcardSets
                  .filter((set) =>
                    set.topic.toLowerCase().startsWith(searchTerm.toLowerCase())
                  )
                  .map((set) => (
                    <Card
                      key={set.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => handleFlashcardSetClick(set.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">
                          {set.topic}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span>
                              {set.flashcard_count} flashcard
                              {set.flashcard_count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Criado em {formatDate(set.created_at)}</span>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-4 bg-primary hover:bg-primary/90"
                          size="sm"
                          disabled={detailsLoading}
                        >
                          {detailsLoading ? "Carregando..." : "Ver Detalhes"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                {/* Add New Flashcard Set Button */}
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-dashed border-2 border-gray-300 hover:border-primary"
                  onClick={() => navigate("/generator")}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500 hover:text-primary transition-colors">
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-4">
                      <span className="text-2xl">+</span>
                    </div>
                    <p className="text-center font-medium">
                      Criar Novo
                      <br />
                      Flashcard Set
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
