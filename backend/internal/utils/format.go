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

// ParseFlashcardsResponse parses the JSON string into a FlashcardsResponse struct.
// If the JSON is an array, it wraps it inside a FlashcardsResponse.
func ParseFlashcardsResponse(jsonStr string) (model.FlashcardsResponse, error) {
	jsonStr = strings.TrimSpace(jsonStr)
	// If the response starts with a '[' then it's a JSON array.
	if len(jsonStr) > 0 && jsonStr[0] == '[' {
		var flashcards []model.Flashcard
		if err := json.Unmarshal([]byte(jsonStr), &flashcards); err != nil {
			return model.FlashcardsResponse{}, err
		}
		return model.FlashcardsResponse{Flashcards: flashcards}, nil
	}

	// Otherwise, assume it's already in the expected structure.
	var resp model.FlashcardsResponse
	err := json.Unmarshal([]byte(jsonStr), &resp)
	return resp, err
}