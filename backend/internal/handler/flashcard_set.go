package handler

import (
	"context"
	"log"
	"net/http"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


type FlashcardSetHandler struct {
	flashcardService services.FlashcardService
	flashcardSetService services.FlashcardSetService
}

func NewFlashcardSetHandler(fs services.FlashcardService, fss services.FlashcardSetService) *FlashcardSetHandler {
	return &FlashcardSetHandler{flashcardService: fs, flashcardSetService: fss}
}

func (h *FlashcardSetHandler) GetFlashcards(c *gin.Context) {
	// Implementar a lógica para obter flashcards
	// Exemplo: c.JSON(http.StatusOK, gin.H{"message": "Get Flashcards"})
}

func (h *FlashcardSetHandler) GetFlashcardSets(c *gin.Context) {
	// Obter todos os flashcard sets do usuário
	
	userIDStr := c.Param("user_id")

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	flashcardSets, err := h.flashcardSetService.GetAllByUserID(context.Background(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcard sets"})
		log.Println("Erro ao obter os flashcard sets:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"flashcard_sets": flashcardSets} )

}

func (h *FlashcardSetHandler) GetFlashcardSetByID(c *gin.Context) {
	// Implementar a lógica para obter um flashcard set específico
	// Exemplo: c.JSON(http.StatusOK, gin.H{"message": "Get Flashcard Set"})
	
	fsetIDStr := c.Param("set_id")
	fsetID, err := uuid.Parse(fsetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard set ID"})
		return
	}
	flashcardSet, err := h.flashcardSetService.GetByID(context.Background(), fsetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcard set"})
		log.Println("Erro ao obter o flashcard set:", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"flashcard_set": flashcardSet} )

}