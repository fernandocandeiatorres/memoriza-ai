package main

import (
	"log"
	"os"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/config"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/handler"
	"github.com/gin-gonic/gin"
)

func main() {
	err := config.LoadEnv()
	if err != nil {
		log.Printf("Warning: No .env file found or failed to load: %v", err)
	}

	router := gin.Default()

	router.POST("/generate-flashcards", handler.GenerateFlashcardsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server Run Failed:", err)
	}
}