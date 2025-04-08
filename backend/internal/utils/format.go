package utils

import (
	"encoding/json"
	"strings"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
)

// stripThinkTagAlternative removes any <think>...</think> segment from the response string.
// It splits the string by "</think>" and returns the part after it if found.
func StripThinkTagAlternative(response string) string {
	// First, remove the <think>...</think> portion.
	parts := strings.Split(response, "</think>")
	var cleaned string
	if len(parts) > 1 {
		cleaned = strings.TrimSpace(parts[1])
	} else {
		cleaned = strings.TrimSpace(response)
	}

	// Next, remove the starting "```json" marker if present.
	const startMarker = "```json"
	if strings.HasPrefix(cleaned, startMarker) {
		cleaned = strings.TrimPrefix(cleaned, startMarker)
		cleaned = strings.TrimSpace(cleaned)
	}

	// Finally, remove the ending "```" marker if present.
	const endMarker = "```"
	if strings.HasSuffix(cleaned, endMarker) {
		cleaned = strings.TrimSuffix(cleaned, endMarker)
		cleaned = strings.TrimSpace(cleaned)
	}

	return cleaned
}

// ParseFlashcardsResponse analisa a string JSON e converte os dados para o FlashcardsResponse.
// Se a resposta for um array, ela itera sobre ele e converte cada objeto,
// atribuindo os valores de "front" para QuestionText e "back" para AnswerText,
// além de definir o CardOrder sequencialmente.
func ParseFlashcardsResponse(jsonStr string) (model.FlashcardsResponse, error) {
	jsonStr = strings.TrimSpace(jsonStr)
	
	// Se a resposta começar com '[' é um array.
	// if len(jsonStr) > 0 && jsonStr[0] == '[' {
	var rawCards []model.FlashcardRaw
	if err := json.Unmarshal([]byte(jsonStr), &rawCards); err != nil {
		return model.FlashcardsResponse{}, err
	}

	var cards []model.Flashcard
	for _, r := range rawCards {
		card := model.Flashcard{
			QuestionText:   r.Front, // Mapeamento de front para question_text
			AnswerText:     r.Back,  // Mapeamento de back para answer_text
		}
		cards = append(cards, card)
	}

	return model.FlashcardsResponse{Flashcards: cards}, nil
	// }

	// Se não for um array, assumimos que já está na estrutura esperada.
	// var resp model.FlashcardsResponse
	// err := json.Unmarshal([]byte(jsonStr), &resp)
	// return resp, err
}

