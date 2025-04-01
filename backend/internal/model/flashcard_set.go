package model

type FlashcardSet struct {
	ID int64 `json:"id"`
	UserID int64 `json:"user_id"`
	Prompt string `json:"prompt"`
	Topic string `json:"topic"`
	CreatedAt string `json:"created_at"`
}