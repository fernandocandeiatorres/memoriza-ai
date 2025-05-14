import { useState, useEffect } from "react";
import type { Flashcard as FlashcardType } from "../types/flashcard";

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext: () => void;
  onPrevious: () => void;
}

export function Flashcard({ flashcard, onNext, onPrevious }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when flashcard changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard]);

  const handleNext = () => {
    if (isFlipped) {
      setIsFlipped(false);
    }
    onNext();
  };

  const handlePrevious = () => {
    if (isFlipped) {
      setIsFlipped(false);
    }
    onPrevious();
  };

  return (
    <div className="relative perspective-1000">
      <div
        className={`relative w-full h-[400px] transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front of card */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col border-2 border-emerald-200 dark:border-emerald-800 ${
            isFlipped ? "invisible" : ""
          }`}
        >
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-200 text-center leading-relaxed">
              {flashcard.question_text}
            </h2>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all duration-200 transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Show Answer
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all duration-200 transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col rotate-y-180 border-2 border-emerald-200 dark:border-emerald-800 ${
            !isFlipped ? "invisible" : ""
          }`}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 text-center leading-relaxed">
              {flashcard.answer_text}
            </p>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all duration-200 transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsFlipped(false)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Show Question
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all duration-200 transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
