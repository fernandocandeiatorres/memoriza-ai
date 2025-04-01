package model

import "encoding/json"

type Flashcard struct {
	ID int64 `json:"id"`
	FlashcardSetID int64 `json:"flashcard_set_id"`
	CardOrder int `json:"card_order"`
	QuestionText string `json:"question_text"`
	AnswerText string `json:"answer_text"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type FlashcardsResponse struct {
	Flashcards []Flashcard `json:"flashcards"`
}

type PromptRequest struct {
	Prompt string `json:"prompt"`
}

// ParseFlashcardsResponse parses the JSON string into a FlashcardsResponse struct.
func ParseFlashcardsResponse(jsonStr string) (FlashcardsResponse, error) {
	var resp FlashcardsResponse
	err := json.Unmarshal([]byte(jsonStr), &resp)
	return resp, err
}