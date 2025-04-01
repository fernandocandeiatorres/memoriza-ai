// internal/deepseek/client.go
package deepseek

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
)

// DeepSeekRequest represents the payload we send to the DeepSeek API.
type DeepSeekRequest struct {
	Prompt string `json:"prompt"`
	// Add any additional parameters if needed.
}

// GenerateFlashcards calls the DeepSeek API and returns the raw response as a string.
func GenerateFlashcards(prompt string) (string, error) {
	apiKey := os.Getenv("DEEPISEEK_API_KEY")
	if apiKey == "" {
		return "", errors.New("DEEPISEEK_API_KEY not set in environment")
	}

	// Prepare the request payload.
	reqPayload := DeepSeekRequest{
		Prompt: prompt,
	}
	reqBody, err := json.Marshal(reqPayload)
	if err != nil {
		return "", err
	}

	// Replace with the actual DeepSeek API endpoint.
	apiURL := "https://api.deepinfra.com/deepseek-ai/deepseek-R1"

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", errors.New("DeepSeek API error: " + string(bodyBytes))
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(bodyBytes), nil
}
