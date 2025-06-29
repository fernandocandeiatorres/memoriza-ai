import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Flashcard as FlashcardType } from "@shared/schema";

interface FlashcardProps {
  card: FlashcardType;
  index: number;
  totalCards: number;
}

export default function Flashcard({ card, index, totalCards }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] mb-6 sm:mb-8 cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-600 transform-style-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full h-full bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 lg:p-7 flex flex-col"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-full">
                  Cartão {index + 1} de {totalCards}
                </div>
                <div className="text-xs text-gray-400 italic">
                  Clique para ver a resposta
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-2 sm:p-4">
                <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-center text-neutral-dark leading-relaxed">
                  {card.question}
                </h4>
              </div>
              <div className="mt-auto flex justify-center">
                <div className="inline-flex items-center justify-center rounded-full bg-gray-100 p-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400 sm:w-6 sm:h-6"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full h-full bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 lg:p-7 flex flex-col backface-hidden rotate-y-180"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-full">
                  Cartão {index + 1} de {totalCards}
                </div>
                <div className="text-xs text-gray-400 italic">
                  Clique para ver a pergunta
                </div>
              </div>
              <div className="flex-grow overflow-auto pr-1 sm:pr-2">
                <div
                  className="prose prose-xs sm:prose-sm md:prose-base max-w-none prose-headings:text-primary prose-strong:text-neutral-dark prose-li:marker:text-primary prose-p:text-gray-700 prose-ul:space-y-1 sm:prose-ul:space-y-2 prose-ol:space-y-1 sm:prose-ol:space-y-2 prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: card.answer }}
                />
              </div>
              <div className="mt-3 sm:mt-4 flex justify-center">
                <div className="inline-flex items-center justify-center rounded-full bg-gray-100 p-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400 sm:w-6 sm:h-6"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
