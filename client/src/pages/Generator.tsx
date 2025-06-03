import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import Footer from "@/components/Footer";
import TopicForm from "@/components/TopicForm";
import FlashcardsContainer from "@/components/FlashcardsContainer";
import { BookOpen, Brain, Target } from "lucide-react";
import {
  type GenerateFlashcardsRequest,
  type Flashcard,
  adaptGoToFrontendResponse,
} from "@shared/schema";
import { generateFlashcards } from "@/lib/goBackendApi";
import { mockGenerateFlashcards } from "@/lib/mockFlashcards";

// Toggle para desenvolvimento: true = usar API Go, false = usar dados mock
// Temporariamente configurado para usar dados mock enquanto configuramos o backend Go
const USE_GO_BACKEND = true;

export default function Generator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentDifficulty, setCurrentDifficulty] =
    useState<string>("intermediate");
  const [hasGeneratedCards, setHasGeneratedCards] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);
        setSession(session);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    getUser();
  }, [navigate, toast]);

  // Função para converter o nível de dificuldade para um nome amigável
  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner":
        return "Iniciante";
      case "intermediate":
        return "Intermediário";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };

  const handleGenerateFlashcards = async (data: GenerateFlashcardsRequest) => {
    if (!session || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar flashcards.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Armazena a dificuldade selecionada
      setCurrentDifficulty(data.difficulty);

      if (USE_GO_BACKEND) {
        // Usando a API Go real com token de autenticação
        const response = await generateFlashcards(data, session.access_token);

        // Adapta a resposta do formato Go para o formato do frontend
        const adaptedFlashcards = adaptGoToFrontendResponse(response);

        // Adiciona o tópico a cada flashcard (já que vem do conjunto)
        const flashcardsWithTopic = adaptedFlashcards.map((card) => ({
          ...card,
          topic: data.topic,
        }));

        setFlashcards(flashcardsWithTopic);
        setCurrentTopic(data.topic);
        setHasGeneratedCards(true);

        // Scroll to flashcards container after they're generated
        setTimeout(() => {
          document
            .getElementById("flashcards-container")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        toast({
          title: "Flashcards gerados!",
          description: `Criados ${
            flashcardsWithTopic.length
          } flashcards para "${
            data.topic
          }" com dificuldade ${getDifficultyLabel(data.difficulty)}`,
        });
      } else {
        // Modo de desenvolvimento com dados simulados
        setTimeout(() => {
          const generatedCards = mockGenerateFlashcards(data);
          setFlashcards(generatedCards);
          setCurrentTopic(data.topic);
          setHasGeneratedCards(true);

          // Scroll to flashcards container after they're generated
          setTimeout(() => {
            document
              .getElementById("flashcards-container")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 100);

          toast({
            title: "Flashcards gerados!",
            description: `Criados ${generatedCards.length} flashcards para "${
              data.topic
            }" com dificuldade ${getDifficultyLabel(data.difficulty)}`,
          });
        }, 1500); // Simula atraso da API
      }
    } catch (error) {
      console.error("Erro ao gerar flashcards:", error);
      toast({
        title: "Erro ao gerar flashcards",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente com um tópico diferente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (!session || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafa]">
      <main className="flex-grow px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 md:mb-5">
              <Brain className="h-7 w-7 md:h-9 md:w-9 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-dark mb-3 md:mb-4 tracking-tight">
              Gerador de Flashcards Médicos
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
              Digite qualquer tópico médico e criaremos 10 flashcards detalhados
              para ajudar você a estudar de forma eficiente.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 mb-8 md:mb-12 border border-gray-100">
            <div className="flex items-center mb-5">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 mr-3 md:mr-4">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-neutral-dark">
                Digite seu tópico de estudo
              </h2>
            </div>

            <TopicForm
              onSubmit={handleGenerateFlashcards}
              isLoading={loading}
            />

            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2">Seja específico para melhores resultados</p>
              </div>
              <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2">Tente condições clínicas ou sistemas</p>
              </div>
              <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2">Cada conjunto contém 10 flashcards</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mb-8 md:mb-12 bg-white rounded-2xl shadow-md p-8 md:p-12 border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-neutral-dark mb-2">
                Gerando seus flashcards...
              </h3>
              <p className="text-gray-600">
                Isso pode levar alguns segundos. Estamos criando flashcards
                personalizados para você.
              </p>
            </div>
          )}

          {hasGeneratedCards && !loading && (
            <div className="mb-8 md:mb-12 bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="flex items-center mb-5">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 mr-3 md:mr-4">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-neutral-dark">
                  Seus flashcards
                </h2>
              </div>

              <FlashcardsContainer
                flashcards={flashcards}
                topic={currentTopic}
                difficulty={currentDifficulty}
              />
            </div>
          )}

          {!hasGeneratedCards && !loading && (
            <div className="text-center p-8 sm:p-12 md:p-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <div className="mx-auto flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-gray-50 mb-3 md:mb-4">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Nenhum flashcard gerado ainda
              </h3>
              <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
                Digite um tópico médico acima para gerar seu primeiro conjunto
                de flashcards.
              </p>
            </div>
          )}

          <div className="text-xs sm:text-sm text-gray-500 text-center mt-4 md:mt-6 bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
            <p>
              Está com problemas? Tente tópicos específicos como "Arritmias
              Cardíacas", "Fisiologia Renal" ou "Neurotransmissores".
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
