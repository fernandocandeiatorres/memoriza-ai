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
  Plus,
  FileText,
  Target,
} from "lucide-react";
import { Link } from "wouter";
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

  // Debug: Print backend URL
  console.log("VITE_GO_BACKEND_URL:", import.meta.env.VITE_GO_BACKEND_URL);
  console.log("All env vars:", import.meta.env);

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
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Voltar ao Dashboard</span>
              </Button>
              <div className="text-center flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 line-clamp-2">
                  {selectedSet.topic}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentCardIndex + 1} de {selectedSetFlashcards.length}{" "}
                  flashcards
                </p>
              </div>
              <Button
                onClick={() => setCurrentCardIndex(0)}
                variant="outline"
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="text-sm">Reiniciar</span>
              </Button>
            </div>

            {/* Flashcard */}
            <div className="mb-6 sm:mb-8">
              <Flashcard
                card={selectedSetFlashcards[currentCardIndex]}
                index={currentCardIndex}
                totalCards={selectedSetFlashcards.length}
              />
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 sm:mb-6">
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
            <div className="flex justify-between items-center gap-4">
              <Button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                variant="outline"
                className="flex-1 sm:flex-none"
                size="sm"
              >
                <span className="text-sm">Anterior</span>
              </Button>
              <span className="text-sm sm:text-base text-gray-600 px-2 text-center">
                {currentCardIndex + 1} / {selectedSetFlashcards.length}
              </span>
              <Button
                onClick={handleNextCard}
                disabled={currentCardIndex === selectedSetFlashcards.length - 1}
                className="flex-1 sm:flex-none"
                size="sm"
              >
                <span className="text-sm">Próximo</span>
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
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Bem-vindo ao seu Dashboard
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Gerencie seus flashcards e acompanhe seu progresso de estudos
            </p>
          </div>

          {/* Quick Actions - New Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/generator">
                <Button className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 sm:px-6 sm:py-3">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Criar por Tópico</span>
                </Button>
              </Link>
              <Link href="/summary-generator">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center gap-2 border-primary text-primary hover:bg-primary/10 px-4 py-2.5 sm:px-6 sm:py-3"
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Criar por Resumo</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* User Profile Card */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email ? (
                      getInitials(user.email)
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Perfil do Usuário
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Suas informações de conta
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Membro desde {formatDate(user?.created_at || "")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Buscar por tópico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total de Conjuntos
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {flashcardSets.length}
                    </p>
                  </div>
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total de Flashcards
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {flashcardSets.reduce(
                        (total, set) => total + set.flashcard_count,
                        0
                      )}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Último Estudo
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
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
                  <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcard Sets */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-lg sm:text-xl">
                    Seus Conjuntos de Flashcards
                  </span>
                </div>
                {flashcardSets.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href="/generator">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Novo Conjunto</span>
                      </Button>
                    </Link>
                  </div>
                )}
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
                  <p className="text-gray-600 mb-6 px-4">
                    {searchTerm
                      ? "Tente ajustar sua busca"
                      : "Comece criando seu primeiro conjunto de flashcards"}
                  </p>
                  {!searchTerm && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                      <Link href="/generator">
                        <Button className="w-full sm:w-auto flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>Criar por Tópico</span>
                        </Button>
                      </Link>
                      <Link href="/summary-generator">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Criar por Resumo</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredFlashcardSets.map((set) => (
                    <Card
                      key={set.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600"
                      onClick={() => handleFlashcardSetClick(set.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2">
                          {set.topic}
                        </h3>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{set.flashcard_count} flashcards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              Criado em {formatDate(set.created_at)}
                            </span>
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
