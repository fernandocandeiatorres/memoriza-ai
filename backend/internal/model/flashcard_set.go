package model

import "time"

type FlashcardSet struct {
	ID int64 `json:"id"`
	UserID int64 `json:"user_id"`
	Topic string `json:"topic"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}