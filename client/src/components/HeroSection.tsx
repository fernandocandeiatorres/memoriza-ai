import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Brain, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, navigate] = useLocation();

  const goToTopicGenerator = () => {
    navigate("/generator");
  };

  const goToSummaryGenerator = () => {
    navigate("/summary-generator");
  };

  return (
    <section id="landing" className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark mb-4">
              Flashcards Médicos{" "}
              <span className="text-primary">Inteligentes</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Gere flashcards personalizados para medicina em segundos. Estude
              de forma mais inteligente com IA.
            </p>
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={goToTopicGenerator}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md text-base font-medium flex items-center justify-center"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Gerar por Tópico
                </Button>
                <Button
                  onClick={goToSummaryGenerator}
                  variant="outline"
                  className="bg-white border border-primary hover:bg-primary/5 text-primary px-6 py-3 rounded-md text-base font-medium flex items-center justify-center"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Gerar por Resumo
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Escolha gerar flashcards a partir de um tópico específico ou
                envie seus resumos/PDFs
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="flex items-center mr-4">
                <CheckCircle className="text-success mr-2 h-4 w-4" /> Login
                opcional
              </span>
              <span className="flex items-center">
                <CheckCircle className="text-success mr-2 h-4 w-4" /> 100%
                gratuito
              </span>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800"
              alt="Estudante de medicina estudando"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
