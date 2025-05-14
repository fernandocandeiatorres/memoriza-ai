import { useState } from "react";
import { generateFlashcards } from "./services/api";
import { Flashcard } from "./components/Flashcard";
import type {
  Flashcard as FlashcardType,
  DifficultyLevel,
} from "./types/flashcard";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedCards = await generateFlashcards({
        prompt: prompt.trim(),
        user_id: "f3884046-387f-4b3a-b8a6-018eec440a3a", // TODO: Replace with actual user ID from authentication
        level: difficulty,
        count: 10,
      });
      setFlashcards(generatedCards);
      setCurrentIndex(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate flashcards"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Medical-themed background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-200 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-200 via-transparent to-transparent"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-4">
            MedFlash
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your AI-powered medical flashcard companion
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 transform transition-all duration-300 hover:shadow-2xl border border-emerald-100 dark:border-emerald-900">
          <div className="flex flex-col gap-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a medical topic (e.g., '10 flashcards for renal physiology')"
                className="flex-1 px-4 py-3 border border-emerald-200 dark:border-emerald-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>

            <div className="flex gap-6 justify-center">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <label
                  key={level}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    difficulty === level
                      ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 backdrop-blur-sm"
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) =>
                      setDifficulty(e.target.value as DifficultyLevel)
                    }
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
          {error && (
            <p className="mt-4 text-red-500 bg-red-50/80 dark:bg-red-900/20 p-3 rounded-lg backdrop-blur-sm">
              {error}
            </p>
          )}
        </div>

        {flashcards.length > 0 && (
          <div className="mb-6 text-center">
            <span className="inline-block px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-100 dark:border-emerald-900 backdrop-blur-sm">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <Flashcard
              flashcard={flashcards[currentIndex]}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
