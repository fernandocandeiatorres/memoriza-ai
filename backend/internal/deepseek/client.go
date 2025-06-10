// internal/deepseek/client.go
package deepseek

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
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
func GenerateFlashcards(prompt string, level string) (model.FlashcardsResponse, error) {
	apiKey := os.Getenv("DEEPISEEK_API_KEY")
	if apiKey == "" {
		return model.FlashcardsResponse{}, errors.New("DEEPISEEK_API_KEY not set in environment")
	}

	// Map difficulty levels to Portuguese descriptions
	difficultyMap := map[string]string{
		"easy":   "nível básico",
		"medium": "nível intermediário",
		"hard":   "nível avançado",
	}

	difficulty := difficultyMap[level]
	if difficulty == "" {
		difficulty = "nível intermediário" // default to medium
	}

	systemPrompt := fmt.Sprintf(
		"Generate 10 flashcards designed for medical school students to practice for exams, based on the topic of %s. "+
			"The flashcards should be at %s, appropriate for medical school standards. "+
			"Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition). "+
			"The content should be concise yet comprehensive, focusing on key concepts, clinical relevance, and testable material. "+
			"Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics) to aid efficient learning. "+
			"Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro",
		prompt,
		difficulty,
	)

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
	req.Header.Set("Authorization", "Bearer "+apiKey)

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

// GenerateFlashcardsFromSummary calls the DeepSeek API to generate flashcards from summary content.
// It supports text, PDF, and image content types.
func GenerateFlashcardsFromSummary(content string, contentType string, level string) (model.FlashcardsResponse, error) {
	apiKey := os.Getenv("DEEPISEEK_API_KEY")
	if apiKey == "" {
		return model.FlashcardsResponse{}, errors.New("DEEPISEEK_API_KEY not set in environment")
	}

	// Map difficulty levels to Portuguese descriptions
	difficultyMap := map[string]string{
		"beginner":     "nível básico",
		"intermediate": "nível intermediário",
		"advanced":     "nível avançado",
	}

	difficulty := difficultyMap[level]
	if difficulty == "" {
		difficulty = "nível intermediário" // default to intermediate
	}

	// Limite de tokens do modelo DeepSeek (deixando margem de segurança)
	maxTokensPerRequest := 120000 // Deixa 40k tokens de margem para a resposta

	// Para conteúdo de texto, aplicamos chunking se necessário
	if contentType == "text" && utils.EstimateTokenCount(content) > maxTokensPerRequest {
		log.Printf("Conteúdo muito grande (%d tokens estimados), aplicando chunking", utils.EstimateTokenCount(content))
		return generateFlashcardsWithChunking(content, contentType, level, difficulty, maxTokensPerRequest)
	}

	// Para conteúdo normal ou não-texto, processa normalmente
	return generateSingleFlashcardSet(content, contentType, level, difficulty)
}

// generateFlashcardsWithChunking processa conteúdo grande dividindo em chunks
func generateFlashcardsWithChunking(content string, contentType string, level string, difficulty string, maxTokens int) (model.FlashcardsResponse, error) {
	chunks := utils.ChunkContent(content, maxTokens)
	log.Printf("Dividindo conteúdo em %d chunks", len(chunks))

	var allResponses []model.FlashcardsResponse
	flashcardsPerChunk := 10 / len(chunks)
	if flashcardsPerChunk < 2 {
		flashcardsPerChunk = 2 // Mínimo de 2 flashcards por chunk
	}

	for i, chunk := range chunks {
		log.Printf("Processando chunk %d/%d (%d tokens estimados)", i+1, len(chunks), utils.EstimateTokenCount(chunk))
		
		// Ajusta o prompt para chunking
		systemPrompt := fmt.Sprintf(
			"Generate %d flashcards designed for medical school students to practice for exams, baseado no resumo/texto que o usuário forneceu (parte %d de %d). "+
				"The flashcards should be at %s, appropriate for medical school standards. "+
				"Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition). "+
				"The content should be concise yet comprehensive, focusing on key concepts, clinical relevance, and testable material extracted from this part of the text. "+
				"Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics) to aid efficient learning. "+
				"Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro",
			flashcardsPerChunk,
			i+1,
			len(chunks),
			difficulty,
		)

		messageContent := fmt.Sprintf("Com base na seguinte parte do resumo/texto (parte %d de %d), gere %d flashcards médicos:\n\n%s", 
			i+1, len(chunks), flashcardsPerChunk, chunk)

		response, err := callDeepSeekAPI(systemPrompt, messageContent)
		if err != nil {
			log.Printf("Erro ao processar chunk %d: %v", i+1, err)
			// Continua com os outros chunks mesmo se um falhar
			continue
		}

		allResponses = append(allResponses, response)
	}

	if len(allResponses) == 0 {
		return model.FlashcardsResponse{}, errors.New("falha ao processar todos os chunks do conteúdo")
	}

	// Combina todas as respostas em uma única
	finalResponse := utils.MergeFlashcardResponses(allResponses, 10)
	log.Printf("Gerados %d flashcards total a partir de %d chunks", len(finalResponse.Flashcards), len(chunks))

	return finalResponse, nil
}

// generateSingleFlashcardSet processa conteúdo que cabe em uma única requisição
func generateSingleFlashcardSet(content string, contentType string, level string, difficulty string) (model.FlashcardsResponse, error) {
	var systemPrompt string
	var messageContent string

	// Create different prompts based on content type
	switch contentType {
	case "text":
		systemPrompt = fmt.Sprintf(
			"Generate 10 flashcards designed for medical school students to practice for exams, baseado no resumo/texto que o usuário forneceu. "+
				"The flashcards should be at %s, appropriate for medical school standards. "+
				"Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition). "+
				"The content should be concise yet comprehensive, focusing on key concepts, clinical relevance, and testable material extracted from the provided text. "+
				"Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics) to aid efficient learning. "+
				"Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro",
			difficulty,
		)
		messageContent = fmt.Sprintf("Com base no seguinte resumo/texto, gere 10 flashcards médicos:\n\n%s", content)

	case "pdf":
		systemPrompt = fmt.Sprintf(
			"Generate 10 flashcards designed for medical school students to practice for exams, baseado no PDF que o usuário enviou (conteúdo codificado em base64). "+
				"The flashcards should be at %s, appropriate for medical school standards. "+
				"Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition). "+
				"The content should be concise yet comprehensive, focusing on key concepts, clinical relevance, and testable material extracted from the PDF content. "+
				"Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics) to aid efficient learning. "+
				"Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro",
			difficulty,
		)
		messageContent = fmt.Sprintf("Com base no seguinte conteúdo PDF (base64), gere 10 flashcards médicos:\n\n%s", content)

	case "image":
		systemPrompt = fmt.Sprintf(
			"Generate 10 flashcards designed for medical school students to practice for exams, baseado na imagem que o usuário enviou (conteúdo codificado em base64). "+
				"The flashcards should be at %s, appropriate for medical school standards. "+
				"Each flashcard should have a 'front' (a question or term) and a 'back' (a detailed, accurate answer or definition). "+
				"The content should be concise yet comprehensive, focusing on key concepts, clinical relevance, and testable material extracted from the image content. "+
				"Ensure variety in the types of questions (e.g., definitions, mechanisms, clinical scenarios, diagnostics) to aid efficient learning. "+
				"Format the output as a JSON array, with each object containing 'front' and 'back' fields. Gere tudo isso em português brasileiro",
			difficulty,
		)
		messageContent = fmt.Sprintf("Com base na seguinte imagem (base64), gere 10 flashcards médicos:\n\n%s", content)

	default:
		return model.FlashcardsResponse{}, fmt.Errorf("unsupported content type: %s", contentType)
	}

	return callDeepSeekAPI(systemPrompt, messageContent)
}

// callDeepSeekAPI faz a chamada real para a API DeepSeek
func callDeepSeekAPI(systemPrompt string, messageContent string) (model.FlashcardsResponse, error) {
	apiKey := os.Getenv("DEEPISEEK_API_KEY")
	if apiKey == "" {
		return model.FlashcardsResponse{}, errors.New("DEEPISEEK_API_KEY not set in environment")
	}

	// Prepare the request payload.
	reqPayload := DeepSeekAPIRequest{
		Model: "deepseek-ai/DeepSeek-R1",
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: messageContent},
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
	req.Header.Set("Authorization", "Bearer "+apiKey)

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

	return flashcardsResponse, nil
}
