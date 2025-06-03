package handler

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


type FlashcardSetHandler struct {
	flashcardService services.FlashcardService
	flashcardSetService services.FlashcardSetService
	userService services.UserService
}

func NewFlashcardSetHandler(fs services.FlashcardService, fss services.FlashcardSetService, us services.UserService) *FlashcardSetHandler {
	return &FlashcardSetHandler{
		flashcardService: fs, 
		flashcardSetService: fss,
		userService: us,
	}
}

func (h *FlashcardSetHandler) GetFlashcards(c *gin.Context) {
	// Implementar a lógica para obter flashcards
	// Exemplo: c.JSON(http.StatusOK, gin.H{"message": "Get Flashcards"})
}

func (h *FlashcardSetHandler) GetFlashcardSets(c *gin.Context) {
	// Obter todos os flashcard sets do usuário com contagem de flashcards
	
	userIDStr := c.Param("user_id")

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Use the flashcard service to get sets with flashcard counts
	flashcardSets, err := h.flashcardService.GetAllUserFlashcards(context.Background(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcard sets"})
		log.Println("Erro ao obter os flashcard sets:", err)
		return
	}

	// Transform the response to include flashcard counts
	type FlashcardSetWithCount struct {
		ID             string `json:"id"`
		UserID         string `json:"user_id"`
		Topic          string `json:"topic"`
		CreatedAt      string `json:"created_at"`
		UpdatedAt      string `json:"updated_at"`
		FlashcardCount int    `json:"flashcard_count"`
	}

	var response []FlashcardSetWithCount
	for _, set := range flashcardSets {
		response = append(response, FlashcardSetWithCount{
			ID:             set.ID,
			UserID:         set.UserID,
			Topic:          set.Topic,
			CreatedAt:      set.CreatedAt,
			UpdatedAt:      set.UpdatedAt,
			FlashcardCount: len(set.Flashcards),
		})
	}

	c.JSON(http.StatusOK, gin.H{"flashcard_sets": response})
}

func (h *FlashcardSetHandler) GetFlashcardSetByID(c *gin.Context) {
	fsetIDStr := c.Param("set_id")
	log.Printf("Received request for flashcard set with set_id: %s", fsetIDStr)
	
	fsetID, err := uuid.Parse(fsetIDStr)
	if err != nil {
		log.Printf("Invalid flashcard set ID format: %s, error: %v", fsetIDStr, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard set ID"})
		return
	}
	
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	log.Printf("Calling flashcard set service to get set: %s", fsetID.String())
	flashcardSet, err := h.flashcardSetService.GetByID(ctx, fsetID)
	if err != nil {
		log.Printf("Erro ao obter o flashcard set %s: %v", fsetID.String(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcard set"})
		return
	}
	
	log.Printf("Successfully retrieved flashcard set: %s with topic: %s", fsetID.String(), flashcardSet.Topic)
	c.JSON(http.StatusOK, gin.H{"flashcard_set": flashcardSet})
}