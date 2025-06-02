import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Flashcard from "@/components/Flashcard";
import { type Flashcard as FlashcardType } from "@shared/schema";

interface FlashcardSet {
  id: string;
  topic: string;
  created_at: string;
  user_id: string;
}

export default function FlashcardSetDetails() {
  const [match, params] = useRoute("/dashboard/flashcard-set/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!match || !params?.id) {
      navigate("/dashboard");
      return;
    }

    fetchFlashcardSetDetails(params.id);
  }, [match, params, navigate]);

  const fetchFlashcardSetDetails = async (setId: string) => {
    try {
      // Mock data for now - replace with actual API calls
      const mockSet: FlashcardSet = {
        id: setId,
        topic: "Cardiologia Básica",
        created_at: "2024-01-15T10:30:00Z",
        user_id: "user-123",
      };

      const mockFlashcards: FlashcardType[] = [
        {
          id: 1,
          question: "Qual é a função principal do coração?",
          answer:
            "O coração é responsável por bombear o sangue através do sistema circulatório, garantindo que oxigênio e nutrientes sejam transportados para todas as células do corpo.",
          topic: "Cardiologia Básica",
        },
        {
          id: 2,
          question: "Quantas câmaras tem o coração humano?",
          answer:
            "O coração humano possui 4 câmaras: 2 átrios (direito e esquerdo) e 2 ventrículos (direito e esquerdo).",
          topic: "Cardiologia Básica",
        },
        {
          id: 3,
          question: "O que é a pressão arterial sistólica?",
          answer:
            "A pressão arterial sistólica é a pressão exercida pelo sangue nas paredes das artérias quando o coração se contrai (sístole), bombeando sangue para o corpo.",
          topic: "Cardiologia Básica",
        },
        {
          id: 4,
          question: "Qual é a diferença entre artérias e veias?",
          answer:
            "Artérias transportam sangue oxigenado do coração para os tecidos (exceto artéria pulmonar), têm paredes mais espessas e pressão maior. Veias transportam sangue desoxigenado dos tecidos de volta ao coração (exceto veias pulmonares), têm paredes mais finas e válvulas.",
          topic: "Cardiologia Básica",
        },
        {
          id: 5,
          question: "O que é um eletrocardiograma (ECG)?",
          answer:
            "O ECG é um exame que registra a atividade elétrica do coração, permitindo detectar arritmias, isquemia, infarto e outras alterações cardíacas através de eletrodos colocados na pele.",
          topic: "Cardiologia Básica",
        },
      ];

      setFlashcardSet(mockSet);
      setFlashcards(mockFlashcards);
    } catch (error) {
      console.error("Error fetching flashcard set details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do flashcard set.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!flashcardSet || flashcards.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Flashcard set não encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                O conjunto de flashcards que você está procurando não existe ou
                foi removido.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {flashcardSet.topic}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{flashcards.length} flashcards</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Criado em {formatDate(flashcardSet.created_at)}</span>
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
                  {currentIndex + 1} de {flashcards.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reiniciar
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Flashcard
                card={flashcards[currentIndex]}
                index={currentIndex}
                totalCards={flashcards.length}
              />
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Anterior
              </Button>

              <div className="flex gap-2">
                {flashcards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsFlipped(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex
                        ? "bg-primary"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
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
            {flashcards.map((flashcard, index) => (
              <Card key={flashcard.id} className="overflow-hidden">
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
                      <p className="text-gray-700">{flashcard.answer}</p>
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
