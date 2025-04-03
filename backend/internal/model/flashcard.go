package model

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

