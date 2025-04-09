package model

import (
	"time"

	"github.com/google/uuid"
)

type FlashcardSet struct {
	ID uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
	Topic string `json:"topic"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}



type FlashcardSetWithFlashcards struct {
	ID        string            `json:"id"`
	UserID    string            `json:"user_id"`
	Topic     string            `json:"topic"`
	CreatedAt string            `json:"created_at"`
	UpdatedAt string            `json:"updated_at"`
	Flashcards []Flashcard `json:"flashcards"`
}
