export interface Flashcard {
  id: string;
  flashcard_set_id: string;
  card_order: number;
  question_text: string;
  answer_text: string;
  created_at: string;
  updated_at: string;
}

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface GenerateFlashcardsRequest {
  prompt: string;
  user_id: string;
  level: DifficultyLevel;
  count?: number;
  options?: {
    includeImages?: boolean;
    includeCitations?: boolean;
  };
}
