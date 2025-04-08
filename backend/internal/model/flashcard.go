package model

import "time"

type FlashcardRaw struct {
	Front string `json:"front"`
	Back  string `json:"back"`
}

type Flashcard struct {
	ID int64 `json:"id" db:"id"`
	FlashcardSetID int64 `json:"flashcard_set_id" db:"flashcard_set_id"`
	CardOrder int `json:"card_order" db:"card_order"`
	QuestionText string `json:"question_text" db:"question_text"`
	AnswerText string `json:"answer_text" db:"answer_text"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type FlashcardsResponse struct {
	Flashcards []Flashcard `json:"flashcards"`
}

type PromptRequest struct {
	UserID int64 `json:"user_id"`
	Prompt string `json:"prompt"`
}

