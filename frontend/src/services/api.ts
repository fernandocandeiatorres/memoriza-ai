import axios from "axios";
import type { Flashcard, GenerateFlashcardsRequest } from "../types/flashcard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateFlashcards = async (
  request: GenerateFlashcardsRequest
): Promise<Flashcard[]> => {
  try {
    const response = await api.post("/api/v1/flashcards/generate", {
      prompt: request.prompt,
      user_id: request.user_id,
      count: request.count || 10,
      options: request.options,
    });
    console.log(response.data);
    return response.data.flashcards;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to generate flashcards"
      );
    }
    throw error;
  }
};
