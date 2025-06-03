import { useState, useEffect } from "react";
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
import { getUserFlashcardSets, getFlashcardsBySetId } from "@/lib/goBackendApi";
import { type Flashcard as FlashcardType } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

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
  const { user, session } = useProtectedRoute();
  const { toast } = useToast();

  // State management
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

  // Data fetching
  useEffect(() => {
    if (!session || !user) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);
        const data = await getUserFlashcardSets(user.id, session.access_token);
        setFlashcardSets(Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error("Failed to fetch flashcard sets", error);
        setFlashcardSets([]);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus flashcards.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [session, user, toast]);

  const handleFlashcardSetClick = async (setId: string) => {
    if (!session || detailsLoading) return;

    // Prevent double-clicking the same set
    if (lastClickedSetId === setId && detailsLoading) {
      logger.debug("Preventing duplicate click for set", setId);
      return;
    }

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

      logger.debug("Fetching flashcards for set", setId);

      // Add a small delay to ensure backend state is clean
      await new Promise((resolve) => setTimeout(resolve, 100));

      const flashcardsData = await getFlashcardsBySetId(
        setId,
        session.access_token
      );

      logger.debug("Flashcards data received", flashcardsData);

      if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
        throw new Error("No flashcards found for this set");
      }

      setSelectedSet({
        id: flashcardSet.id,
        topic: flashcardSet.topic,
        created_at: flashcardSet.created_at,
        user_id: flashcardSet.user_id,
      } as FlashcardSetDetails);

      setSelectedSetFlashcards(flashcardsData);
      setCurrentCardIndex(0);
    } catch (error) {
      logger.error("Error fetching flashcards", error);

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
    logger.debug("Clearing flashcard set state and returning to dashboard");

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
          const data = await getUserFlashcardSets(
            user.id,
            session.access_token
          );
          setFlashcardSets(Array.isArray(data) ? data : []);
        } catch (error) {
          logger.error("Error refetching flashcard sets", error);
          setFlashcardSets([]);
        } finally {
          setDataLoading(false);
        }
      };
      refetchData();
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % selectedSetFlashcards.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) =>
      prev === 0 ? selectedSetFlashcards.length - 1 : prev - 1
    );
  };

  const filteredFlashcardSets = flashcardSets.filter((set) =>
    set.topic.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // Loading state
  if (!user || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Details view
  if (selectedSet && selectedSetFlashcards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedSet.topic}
                </h1>
                <p className="text-gray-600">
                  {currentCardIndex + 1} de {selectedSetFlashcards.length}{" "}
                  flashcards
                </p>
              </div>
              <Button
                onClick={() => setCurrentCardIndex(0)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
            </div>

            {/* Flashcard */}
            <div className="mb-8">
              <Flashcard
                card={selectedSetFlashcards[currentCardIndex]}
                index={currentCardIndex}
                totalCards={selectedSetFlashcards.length}
              />
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentCardIndex + 1) / selectedSetFlashcards.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                Anterior
              </Button>
              <span className="text-gray-600">
                {currentCardIndex + 1} / {selectedSetFlashcards.length}
              </span>
              <Button
                onClick={handleNextCard}
                disabled={currentCardIndex === selectedSetFlashcards.length - 1}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao seu Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Gerencie seus flashcards e acompanhe seu progresso de estudos
            </p>
          </div>

          {/* User Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email ? (
                      getInitials(user.email)
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">Perfil do Usuário</h2>
                  <p className="text-gray-600">Suas informações de conta</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    Membro desde {formatDate(user?.created_at || "")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por tópico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total de Conjuntos
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flashcardSets.length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total de Flashcards
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flashcardSets.reduce(
                        (total, set) => total + set.flashcard_count,
                        0
                      )}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Último Estudo
                    </p>
                    <p className="text-sm text-gray-600">
                      {flashcardSets.length > 0
                        ? formatDateTime(
                            Math.max(
                              ...flashcardSets.map((set) =>
                                new Date(set.updated_at).getTime()
                              )
                            ).toString()
                          )
                        : "Nunca"}
                    </p>
                  </div>
                  <UserIcon className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcard Sets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Seus Conjuntos de Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFlashcardSets.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm
                      ? "Nenhum resultado encontrado"
                      : "Nenhum flashcard encontrado"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "Tente ajustar sua busca"
                      : "Comece criando seu primeiro conjunto de flashcards"}
                  </p>
                  {!searchTerm && (
                    <Button>
                      <a href="/generator">Criar Primeiro Conjunto</a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFlashcardSets.map((set) => (
                    <Card
                      key={set.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                      onClick={() => handleFlashcardSetClick(set.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900">
                          {set.topic}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{set.flashcard_count} flashcards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Criado em {formatDate(set.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
