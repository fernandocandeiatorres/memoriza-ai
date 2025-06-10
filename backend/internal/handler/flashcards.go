// internal/handler/flashcards.go
package handler

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/deepseek"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FlashcardHandler struct {
	flashcardService services.FlashcardService
	flashcardSetService services.FlashcardSetService
	userService services.UserService
}

func NewFlashcardHandler(fs services.FlashcardService, fss services.FlashcardSetService, us services.UserService) *FlashcardHandler {
	return &FlashcardHandler{
		flashcardService: fs, 
		flashcardSetService: fss,
		userService: us,
	}
}

// FlashcardResponse represents the format expected by the frontend
type FlashcardResponse struct {
	ID    string `json:"id"`
	Front string `json:"front"`
	Back  string `json:"back"`
}

// GenerateFlashcardsHandler handles POST requests to generate flashcards using the DeepSeek API.
// It expects a JSON payload with a "prompt" field and user_id.
func (h *FlashcardHandler) GenerateFlashcards(c *gin.Context) {
	var promptReq model.PromptRequest

	// Validate the incoming JSON payload.
	if err := c.ShouldBindJSON(&promptReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get user info from context (set by auth middleware)
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userEmail, _ := c.Get("userEmail") // Optional, might be empty

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	ctx := context.Background()

	// Ensure user exists in our database
	email := ""
	if userEmail != nil {
		email = userEmail.(string)
	}
	
	_, err = h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	// 1. Criar o FlashcardSet
	set := model.FlashcardSet{
		UserID:    userID, // Use userID from context instead of request body
		Topic:     promptReq.Prompt, // opcional: extração simples
	}
	setID, err := h.flashcardSetService.Create(ctx, set)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create flashcard set"})
		log.Printf("Erro ao criar o flashcard set: %v", err)
		return
	}

	// 2. Gerar os flashcards
	flashcardSet, err := deepseek.GenerateFlashcards(promptReq.Prompt, promptReq.Level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. Gerar e salvar os flashcards associando ao setID
	stored, err := h.flashcardService.GenerateAndStoreFlashcards(ctx, flashcardSet.Flashcards, setID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

	// Log the generated flashcards for debugging purposes.
	log.Printf("Criado set ID: %s com %d flashcards para usuário %s", setID.String(), len(stored), userID.String())

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, gin.H{"flashcard_set_id": setID, "flashcards": stored})
}

// GenerateFlashcardsFromSummary handles POST requests to generate flashcards from summary content.
// It supports text, PDF, and image content types.
func (h *FlashcardHandler) GenerateFlashcardsFromSummary(c *gin.Context) {
	var summaryReq model.SummaryRequest

	// Validate the incoming JSON payload.
	if err := c.ShouldBindJSON(&summaryReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get user info from context (set by auth middleware)
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userEmail, _ := c.Get("userEmail") // Optional, might be empty

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	ctx := context.Background()

	// Ensure user exists in our database
	email := ""
	if userEmail != nil {
		email = userEmail.(string)
	}
	
	_, err = h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	// Determine topic name based on content type and file name
	topicName := "Resumo de Estudo"
	if summaryReq.FileName != nil && *summaryReq.FileName != "" {
		topicName = *summaryReq.FileName
	} else if summaryReq.ContentType == "pdf" {
		topicName = "Documento PDF"
	} else if summaryReq.ContentType == "image" {
		topicName = "Imagem de Estudo"
	}

	// 1. Criar o FlashcardSet
	set := model.FlashcardSet{
		UserID: userID,
		Topic:  topicName,
	}
	setID, err := h.flashcardSetService.Create(ctx, set)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create flashcard set"})
		log.Printf("Erro ao criar o flashcard set: %v", err)
		return
	}

	// 2. Generate flashcards from summary content
	flashcardSet, err := deepseek.GenerateFlashcardsFromSummary(summaryReq.Content, summaryReq.ContentType, summaryReq.Level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. Store the generated flashcards
	stored, err := h.flashcardService.GenerateAndStoreFlashcards(ctx, flashcardSet.Flashcards, setID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log the generated flashcards for debugging purposes.
	log.Printf("Criado set ID: %s com %d flashcards do resumo para usuário %s", setID.String(), len(stored), userID.String())

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, gin.H{"flashcard_set_id": setID, "flashcards": stored})
}

func (h *FlashcardHandler) GetFlashcardsBySetID(c *gin.Context) {
	setIDStr := c.Param("set_id")
	log.Printf("Received request for flashcards with set_id: %s", setIDStr)
	
	setID, err := uuid.Parse(setIDStr)
	if err != nil {
		log.Printf("Invalid flashcard set ID format: %s, error: %v", setIDStr, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard set ID"})
		return
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Printf("Calling flashcard service to get flashcards for set: %s", setID.String())
	flashcards, err := h.flashcardService.GetAllBySetID(ctx, setID)
	if err != nil {
		log.Printf("Erro ao obter os flashcards para set %s: %v", setID.String(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcards"})
		return
	}
	
	log.Printf("Successfully retrieved %d flashcards for set %s", len(flashcards), setID.String())
	c.JSON(http.StatusOK, gin.H{"flashcards": flashcards})
}

func (h *FlashcardHandler) GetFlashcardsByTopic(c *gin.Context) {
	userIDStr := c.Param("user_id")
	topic := c.Query("topic")

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	flashcards, err := h.flashcardService.GetFlashcardsByTopic(context.Background(), userID, topic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcards"})
		log.Println("Erro ao obter os flashcards:", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"flashcards": flashcards} )
}

func (h *FlashcardHandler) GetAllUserFlashcards(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	
	flashcardSets, err := h.flashcardService.GetAllUserFlashcards(context.Background(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcards"})
		log.Println("Erro ao obter os flashcards:", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_flashcard_sets": flashcardSets} )
}