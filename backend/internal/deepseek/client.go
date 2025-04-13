// internal/deepseek/client.go
package deepseek

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/utils"
)

type Message struct {
	Role string `json:"role"`
	Content string `json:"content"`
}

// DeepSeekAPIRequest represents the request body for the DeepSeek API
type DeepSeekAPIRequest struct {
	Model    string `json:"model"`
	Messages []Message `json:"messages"`
}

// DeepSeekAPIResponse represents the response body from the DeepSeek API
type DeepSeekAPIResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}


// GenerateFlashcards calls the DeepSeek API and returns the raw response as a string.
func GenerateFlashcards(prompt string) (model.FlashcardsResponse, error) {
	apiKey := os.Getenv("DEEPISEEK_API_KEY")
	if apiKey == "" {
		return model.FlashcardsResponse{}, errors.New("DEEPISEEK_API_KEY not set in environment")
	}

	systemPrompt := "Generate 10 flashcards designed for medical school students to practice for exams, based on the topic of " + 
		prompt + " . Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition), " + 
		"written at a knowledge level appropriate for medical school standards. The content should be concise yet comprehensive, focusing on key concepts," + 
		" clinical relevance, and testable material. Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics)" + 
		" to aid efficient learning. Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro"


	// Prepare the request payload.
	reqPayload := DeepSeekAPIRequest{
		Model: "deepseek-ai/DeepSeek-R1",
		Messages: []Message{
			{Role: "user", Content: systemPrompt},
		},
	}

	reqBody, err := json.Marshal(reqPayload)
	if err != nil {
		return model.FlashcardsResponse{}, err
	}

	// Replace with the actual DeepSeek API endpoint.
	apiURL := "https://api.deepinfra.com/v1/openai/chat/completions"

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return model.FlashcardsResponse{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return model.FlashcardsResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return model.FlashcardsResponse{}, errors.New("DeepSeek API error: " + string(bodyBytes))
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return model.FlashcardsResponse{}, err
	}

	// Parse API Response
	var apiResponse DeepSeekAPIResponse
	if err := json.Unmarshal(bodyBytes, &apiResponse); err != nil {
		return model.FlashcardsResponse{}, err
	}

	if len(apiResponse.Choices) == 0 {
		return model.FlashcardsResponse{}, errors.New("DeepSeek API returned empty choices")
	}
	rawContent := apiResponse.Choices[0].Message.Content
	// Remove <think></think> tags using regex
	cleanContent := utils.StripThinkTagAlternative(rawContent)
	// Parse the cleaned JSON into FlashcardsResponse.
	var flashcardsResponse model.FlashcardsResponse

	flashcardsResponse, err = utils.ParseFlashcardsResponse(cleanContent)
	if err != nil {
		return model.FlashcardsResponse{}, err
	}

	log.Println("flashcardsResponse: ", flashcardsResponse)

	return flashcardsResponse, nil
}
