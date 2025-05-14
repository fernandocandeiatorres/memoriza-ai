package api

import (
        "log"
        "os"

        "github.com/fernandocandeiatorres/memoriza-ai/backend/internal/handler"
        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
)

// SetupRouter initializes the Gin router and maps the API routes.
func SetupRouter(flashcardHandler *handler.FlashcardHandler, flashcardSetHandler *handler.FlashcardSetHandler) *gin.Engine {
        router := gin.Default()

        // Configure CORS
        router.Use(cors.New(cors.Config{
                AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5000", "*"},
                AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
                AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
                ExposeHeaders:    []string{"Content-Length"},
                AllowCredentials: true,
        }))

        // Group endpoints under /api/v1
        apiV1 := router.Group("/api/v1")
        {
                apiV1.GET("flashcardsets/:set_id/flashcards", flashcardHandler.GetFlashcardsBySetID)
                apiV1.GET("flashcardsets/:set_id", flashcardSetHandler.GetFlashcardSetByID)

                apiV1.GET("/users/:user_id/flashcardsets", flashcardSetHandler.GetFlashcardSets)
                apiV1.GET("/users/:user_id/flashcards-topic", flashcardHandler.GetFlashcardsByTopic)
                apiV1.GET("/users/:user_id/flashcards", flashcardHandler.GetAllUserFlashcards)

                apiV1.POST("/flashcards/generate", flashcardHandler.GenerateFlashcards)
                // Add OPTIONS route for CORS preflight
                apiV1.OPTIONS("/flashcards/generate", func(c *gin.Context) {
                        c.Status(200)
                })
        }

        return router
}

// RunServer starts the Gin server with the port specified in the environment.
func RunServer(router *gin.Engine) {
        port := os.Getenv("PORT")
        if port == "" {
                port = "8080"
        }
        log.Printf("Servidor rodando na porta %s", port)
        router.Run(":" + port)
}

// GET ALL FLASHCARDS SETS OF A USER, AND ALSO GET ALL THE FLASHCARDS FROM EACH FLASHCARD SET ON THIS RESPONSE
// SO KINDA LIKE RESPONSE: []FLASHCARDSET : {FLASHCARDS}