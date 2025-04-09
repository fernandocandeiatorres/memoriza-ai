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