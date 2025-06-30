import { useState } from "react";
import Footer from "@/components/Footer";
import SummaryForm from "@/components/SummaryForm";
import FlashcardsContainer from "@/components/FlashcardsContainer";
import { BookOpen, Brain, FileText, Zap } from "lucide-react";
import {
  type GenerateFromSummaryRequest,
  type Flashcard,
  adaptGoToFrontendResponse,
} from "@shared/schema";
import { generateFlashcardsFromSummary } from "@/lib/goBackendApi";
import { mockGenerateFlashcards } from "@/lib/mockFlashcards";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { getDifficultyLabel, scrollToElement } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { API_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function SummaryGenerator() {
  const { user, session } = useProtectedRoute();
  const { toast } = useToast();
  const {
    hasInsufficientCredits,
    showInsufficientCreditsError,
    showCreditsSuccess,
    showCreditsWarning,
    updateCredits,
  } = useCredits();
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentDifficulty, setCurrentDifficulty] =
    useState<string>("intermediate");
  const [hasGeneratedCards, setHasGeneratedCards] = useState(false);

  const handleGenerateFlashcards = async (data: GenerateFromSummaryRequest) => {
    if (!session || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para gerar flashcards.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient credits
    if (hasInsufficientCredits()) {
      showInsufficientCreditsError();
      return;
    }

    setLoading(true);

    try {
      setCurrentDifficulty(data.difficulty);

      if (API_CONFIG.USE_GO_BACKEND) {
        const response = await generateFlashcardsFromSummary(
          data,
          session.access_token
        );
        const adaptedFlashcards = adaptGoToFrontendResponse(response);

        const flashcardsWithTopic = adaptedFlashcards.map((card) => ({
          ...card,
          topic: data.fileName || "Resumo de Estudo",
        }));

        setFlashcards(flashcardsWithTopic);
        setCurrentTopic(data.fileName || "Resumo de Estudo");
        setHasGeneratedCards(true);

        // Update credits and show success notification
        if (response.credits_remaining !== undefined) {
          updateCredits(response.credits_remaining);
          showCreditsSuccess(
            response.credits_remaining,
            flashcardsWithTopic.length
          );

          // Show warning if credits are low
          if (response.credits_remaining <= 1) {
            showCreditsWarning();
          }
        }

        scrollToElement("flashcards-container");
      } else {
        // Development mode
        setTimeout(() => {
          const generatedCards = mockGenerateFlashcards({
            topic: data.fileName || "Resumo de Estudo",
            difficulty: data.difficulty,
          });
          setFlashcards(generatedCards);
          setCurrentTopic(data.fileName || "Resumo de Estudo");
          setHasGeneratedCards(true);

          scrollToElement("flashcards-container");

          toast({
            title: "✅ Flashcards Gerados!",
            description: `Criados ${generatedCards.length} flashcards do seu resumo (modo simulação)`,
          });
        }, API_CONFIG.SIMULATION_DELAY);
      }
    } catch (error) {
      logger.error("Erro ao gerar flashcards", error);

      // Enhanced error handling
      let errorMessage = "Tente novamente com um arquivo diferente.";
      let errorTitle = "Erro ao Gerar Flashcards";

      if (error instanceof Error) {
        if (error.message.includes("insufficient credits")) {
          errorTitle = "Créditos Insuficientes";
          errorMessage =
            "Você não tem créditos suficientes para gerar flashcards.";
        } else if (error.message.includes("network")) {
          errorTitle = "Erro de Conexão";
          errorMessage =
            "Verifique sua conexão com a internet e tente novamente.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
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
              Gerar Flashcards do Resumo
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
              Envie seus resumos, PDFs ou imagens de estudo e criaremos 10
              flashcards personalizados baseados no conteúdo fornecido.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 mb-8 md:mb-12 border border-gray-100">
            <div className="flex items-center mb-5">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 mr-3 md:mr-4">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-neutral-dark">
                Envie seu material de estudo
              </h2>
            </div>

            <SummaryForm
              onSubmit={handleGenerateFlashcards}
              isLoading={loading}
            />
          </div>

          {hasGeneratedCards && (
            <div id="flashcards-container" className="mb-8 md:mb-12">
              <div className="flex items-center mb-5">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 mr-3 md:mr-4">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-neutral-dark">
                  Seus flashcards baseados em "{currentTopic}"
                </h2>
              </div>

              <FlashcardsContainer
                flashcards={flashcards}
                topic={currentTopic}
                difficulty={currentDifficulty}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
