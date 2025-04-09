// internal/handler/flashcards.go
package handler

import (
	"context"
	"log"
	"net/http"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/deepseek"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FlashcardHandler struct {
	flashcardService services.FlashcardService
	flashcardSetService services.FlashcardSetService
}

func NewFlashcardHandler(fs services.FlashcardService, fss services.FlashcardSetService) *FlashcardHandler {
	return &FlashcardHandler{flashcardService: fs, flashcardSetService: fss}
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

	ctx := context.Background()

	// 1. Criar o FlashcardSet
	set := model.FlashcardSet{
		UserID:    promptReq.UserID,
		Topic:     promptReq.Prompt, // opcional: extração simples
	}
	setID, err := h.flashcardSetService.Create(ctx, set)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create flashcard set"})
		log.Fatalln("Erro ao criar o flashcard set:", err)
		return
	}

	// 2. Gerar os flashcards
	flashcardSet, err := deepseek.GenerateFlashcards(promptReq.Prompt)
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
	log.Printf("Criado set ID: %d com %d flashcards", setID, len(stored))

	// Respond with the generated flashcards.
	c.JSON(http.StatusOK, gin.H{"flashcard_set_id": setID ,"flashcards": stored})
}

func (h *FlashcardHandler) GetFlashcardsBySetID(c *gin.Context) {
	
	setIDStr := c.Param("set_id")
	setID, err := uuid.Parse(setIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid flashcard set ID"})
		return
	}

	flashcards, err := h.flashcardService.GetAllBySetID(context.Background(), setID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch flashcards"})
		log.Println("Erro ao obter os flashcards:", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"flashcards": flashcards} )
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