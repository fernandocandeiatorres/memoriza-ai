import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Flashcard from "./Flashcard";
import { type Flashcard as FlashcardType } from "@shared/schema";

interface FlashcardsContainerProps {
  flashcards: FlashcardType[];
  topic: string;
  difficulty?: string;
}

export default function FlashcardsContainer({ flashcards, topic, difficulty = "intermediate" }: FlashcardsContainerProps) {
  // Função para obter o label da dificuldade
  const getDifficultyLabel = (): string => {
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
  
  // Função para obter a cor da dificuldade
  const getDifficultyColor = (): string => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div id="flashcards-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3 md:gap-4">
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <h3 className="text-lg md:text-xl font-semibold text-neutral-dark bg-primary/5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg inline-flex overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-primary mr-2 flex-shrink-0">Tópico:</span> 
            <span className="truncate">{topic}</span>
          </h3>
          <div className={`text-xs md:text-sm font-medium px-3 md:px-4 py-1 rounded-lg inline-flex items-center ${getDifficultyColor()}`}>
            <span className="mr-2">Dificuldade:</span> {getDifficultyLabel()}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm w-full md:w-auto justify-center md:justify-start">
          <span className="text-gray-600 flex-shrink-0">Progresso:</span>
          <div className="w-24 sm:w-32 md:w-40 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-gray-600 flex-shrink-0">
            {currentCardIndex + 1}/{flashcards.length}
          </span>
        </div>
      </div>

      {/* Flashcard Display */}
      <Flashcard 
        card={flashcards[currentCardIndex]} 
        index={currentCardIndex}
        totalCards={flashcards.length}
      />

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="bg-white border border-gray-200 text-gray-700 px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 text-xs sm:text-sm"
          onClick={handlePrevCard}
          disabled={currentCardIndex === 0}
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Anterior
        </Button>

        <div className="hidden sm:flex space-x-1.5">
          {flashcards.map((_, i) => (
            <div
              key={i}
              className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full transition-all ${
                i === currentCardIndex
                  ? "bg-primary scale-110"
                  : "bg-gray-300 opacity-40"
              }`}
            />
          ))}
        </div>
        <div className="flex sm:hidden text-xs text-gray-500">
          {currentCardIndex + 1} / {flashcards.length}
        </div>

        <Button
          variant={currentCardIndex === flashcards.length - 1 ? "default" : "outline"}
          className={`px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${
            currentCardIndex === flashcards.length - 1
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
          onClick={handleNextCard}
          disabled={currentCardIndex === flashcards.length - 1}
        >
          Próximo <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Additional Options */}
      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
        <Button variant="ghost" className="bg-gray-50 text-neutral-dark px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs sm:text-sm flex items-center hover:bg-gray-100">
          <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="whitespace-nowrap">Salvar PDF</span>
        </Button>
        <Button variant="ghost" className="bg-gray-50 text-neutral-dark px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs sm:text-sm flex items-center hover:bg-gray-100">
          <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="whitespace-nowrap">Compartilhar</span>
        </Button>
        <Button variant="ghost" className="bg-primary/10 text-primary px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs sm:text-sm flex items-center hover:bg-primary/20">
          <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
          </svg>
          <span className="whitespace-nowrap">Novo Conjunto</span>
        </Button>
      </div>
    </div>
  );
}
