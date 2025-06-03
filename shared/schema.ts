import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Mantemos as definições originais para compatibilidade com código existente
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  topic: true,
  question: true,
  answer: true,
});

export const generateFlashcardsSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("intermediate"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type GenerateFlashcardsRequest = z.infer<
  typeof generateFlashcardsSchema
>;

// Tipos para integração com o backend Go
export interface GoFlashcard {
  id: string; // UUID no backend Go
  flashcard_set_id: string; // UUID no backend Go
  card_order: number; // Ordem do cartão no conjunto
  question_text: string; // Corresponde ao "question" do frontend
  answer_text: string; // Corresponde ao "answer" do frontend
  created_at: string; // Data ISO
  updated_at: string; // Data ISO
}

export interface GoFlashcardSet {
  id: string; // UUID no backend Go
  user_id: string; // UUID do usuário
  topic: string; // Tópico do conjunto
  created_at: string; // Data ISO
  updated_at: string; // Data ISO
}

export interface GoFlashcardSetWithFlashcards extends GoFlashcardSet {
  flashcards: GoFlashcard[]; // Flashcards associados a este conjunto
}

export interface GenerateFlashcardsResponse {
  flashcard_set_id: string; // ID do conjunto criado
  flashcards: GoFlashcard[]; // Lista de flashcards gerados
}

// Tipo do request para geração de flashcards no backend Go
export interface GoGenerateFlashcardsRequest {
  prompt: string; // Tópico para geração (equivalente ao 'topic')
  level?: string; // Nível de dificuldade para os flashcards (renamed from 'difficulty')
}

// Adaptador para converter o formato do frontend para o formato do Go backend
export function adaptFrontendToGoRequest(
  frontendRequest: GenerateFlashcardsRequest
): GoGenerateFlashcardsRequest {
  return {
    prompt: frontendRequest.topic,
    level: frontendRequest.difficulty, // Mapeamos 'difficulty' para 'level'
  };
}

// Adaptador para converter o formato do Go backend para o formato do frontend
export function adaptGoToFrontendResponse(
  goResponse: GenerateFlashcardsResponse
): Flashcard[] {
  return goResponse.flashcards.map((goFlashcard, index) => ({
    id: index, // Usamos o índice como ID local para renderização
    topic: "", // Será preenchido com o tópico específico no Generator.tsx
    question: goFlashcard.question_text,
    answer: goFlashcard.answer_text,
  }));
}
