// internal/handler/flashcards.go
package handler

import (
	"context"
	"fmt"
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
	
	user, err := h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	// Check if user has sufficient credits (1 credit = 1 flashcard set)
	if user.Credits < 1 {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": "insufficient_credits", 
			"message": fmt.Sprintf("❌ Créditos insuficientes! Você precisa de 1 crédito para gerar flashcards. Você tem %d créditos.", user.Credits),
			"credits": user.Credits,
			"success": false,
		})
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

	// 4. Consume 1 credit after successful generation
	err = h.userService.ConsumeCredits(ctx, userID, 1)
	if err != nil {
		log.Printf("Error consuming credits for user %s: %v", userID, err)
		// Note: We don't return error here since flashcards were already generated
		// In a production system, you might want to implement compensation logic
	}

	// Get updated user credits to return to frontend
	remainingCredits, err := h.userService.GetUserCredits(ctx, userID)
	if err != nil {
		log.Printf("Error getting user credits: %v", err)
		remainingCredits = 0 // Safe fallback
	}

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, gin.H{
		"flashcard_set_id": setID, 
		"flashcards": stored,
		"credits_remaining": remainingCredits,
		"message": fmt.Sprintf("✅ %d flashcards gerados com sucesso! Restam %d créditos.", len(stored), remainingCredits),
		"success": true,
	})
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
	
	user, err := h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	// Check if user has sufficient credits (1 credit = 1 flashcard set)
	if user.Credits < 1 {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": "insufficient_credits", 
			"message": fmt.Sprintf("❌ Créditos insuficientes! Você precisa de 1 crédito para gerar flashcards. Você tem %d créditos.", user.Credits),
			"credits": user.Credits,
			"success": false,
		})
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

	// 4. Consume 1 credit after successful generation
	err = h.userService.ConsumeCredits(ctx, userID, 1)
	if err != nil {
		log.Printf("Error consuming credits for user %s: %v", userID, err)
		// Note: We don't return error here since flashcards were already generated
		// In a production system, you might want to implement compensation logic
	}

	// Get updated user credits to return to frontend
	remainingCredits, err := h.userService.GetUserCredits(ctx, userID)
	if err != nil {
		log.Printf("Error getting user credits: %v", err)
		remainingCredits = 0 // Safe fallback
	}

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, gin.H{
		"flashcard_set_id": setID, 
		"flashcards": stored,
		"credits_remaining": remainingCredits,
		"message": fmt.Sprintf("✅ %d flashcards criados do seu resumo! Restam %d créditos.", len(stored), remainingCredits),
		"success": true,
	})
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

func (h *FlashcardHandler) GetUserCredits(c *gin.Context) {
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
	
	log.Printf("Getting user credits for user %s", userID.String())
	user, err := h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"credits": user.Credits})
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

func (h *FlashcardHandler) GetUserDashboardData(c *gin.Context) {
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
	
	log.Printf("Getting dashboard data for user %s", userID.String())
	user, err := h.userService.EnsureUserExists(ctx, userID, email)
	if err != nil {
		log.Printf("Error ensuring user exists: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	// Get flashcard sets with flashcard counts using the flashcard service
	flashcardSetsWithFlashcards, err := h.flashcardService.GetAllUserFlashcards(ctx, userID)
	if err != nil {
		log.Printf("Error getting flashcard sets for user %s: %v", userID.String(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcard sets"})
		return
	}

	// Transform to include flashcard counts (same as GetFlashcardSets)
	type FlashcardSetWithCount struct {
		ID             string `json:"id"`
		UserID         string `json:"user_id"`
		Topic          string `json:"topic"`
		CreatedAt      string `json:"created_at"`
		UpdatedAt      string `json:"updated_at"`
		FlashcardCount int    `json:"flashcard_count"`
	}

	var flashcardSets []FlashcardSetWithCount
	for _, set := range flashcardSetsWithFlashcards {
		flashcardSets = append(flashcardSets, FlashcardSetWithCount{
			ID:             set.ID,
			UserID:         set.UserID,
			Topic:          set.Topic,
			CreatedAt:      set.CreatedAt,
			UpdatedAt:      set.UpdatedAt,
			FlashcardCount: len(set.Flashcards),
		})
	}

	// Return both credits and flashcard sets in a single response
	c.JSON(http.StatusOK, gin.H{
		"credits": user.Credits,
		"flashcard_sets": flashcardSets,
	})
}