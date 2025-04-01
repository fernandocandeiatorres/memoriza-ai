// internal/handler/flashcards.go
package handler

import (
	"log"
	"net/http"
	"strings"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/deepseek"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/gin-gonic/gin"
)

// GenerateFlashcardsHandler handles POST requests to generate flashcards using the DeepSeek API.
// It expects a JSON payload with a "prompt" field.
//
// Example of a DeepSeek API response:
// <think>This is some meta-information</think>
// {
//   "flashcards": [
//     {
//       "front": "What is the main function of the heart?",
//       "back": "To pump blood throughout the body."
//     },
//     {
//       "front": "What is an arrhythmia?",
//       "back": "An irregular heartbeat."
//     }
//   ]
// }
//
// This handler strips out the <think>...</think> portion before parsing the JSON.
func GenerateFlashcardsHandler(c *gin.Context) {
	var promptReq model.PromptRequest

	// Validate the incoming JSON payload.
	if err := c.ShouldBindJSON(&promptReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Call the DeepSeek integration to generate flashcards.
	// This function will call the deepseek API and return a raw string response.
	rawResponse, err := deepseek.GenerateFlashcards(promptReq.Prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Remove any <think>...</think> wrappers.
	cleanResponse := stripThinkTag(rawResponse)

	// Parse the cleaned JSON into our FlashcardsResponse model.
	flashcardSet, err := model.ParseFlashcardsResponse(cleanResponse)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse flashcards JSON: " + err.Error()})
		return
	}

	// Log the generated flashcards for debugging purposes.
	log.Printf("Generated flashcard set: %+v", flashcardSet)

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, flashcardSet)
}

// stripThinkTag removes any <think>...</think> segments from the response string.
func stripThinkTag(response string) string {
	// Look for the closing </think> tag and remove everything up to it.
	if idx := strings.Index(response, "</think>"); idx != -1 {
		// Return the substring after the closing tag.
		return strings.TrimSpace(response[idx+len("</think>"):])
	}
	return strings.TrimSpace(response)
}
