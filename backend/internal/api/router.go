package api

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/handler"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter initializes the Gin router and maps the API routes.
func SetupRouter(flashcardHandler *handler.FlashcardHandler, flashcardSetHandler *handler.FlashcardSetHandler) *gin.Engine {
	router := gin.Default()

	// Configure CORS with dynamic origins
	allowedOrigins := []string{
		"https://memoriza-ai.vercel.app",
		"http://localhost:3000",
		"http://localhost:5173", // Vite dev server
	}

	// Add Railway domain if in production
	if railwayDomain := os.Getenv("RAILWAY_STATIC_URL"); railwayDomain != "" {
		allowedOrigins = append(allowedOrigins, "https://"+railwayDomain)
	}

	// Add custom domain from environment if set
	if customOrigin := os.Getenv("ALLOWED_ORIGIN"); customOrigin != "" {
		allowedOrigins = append(allowedOrigins, customOrigin)
	}

	log.Printf("CORS configured for origins: %s", strings.Join(allowedOrigins, ", "))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Add global OPTIONS handler for preflight requests
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Status(200)
	})

	// Health check endpoint (não precisa de autenticação)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "API is running",
			"version":   "1.0.0",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Group endpoints under /api/v1
	apiV1 := router.Group("/api/v1", middleware.SupabaseAuth())
	{
		apiV1.GET("flashcardsets/:set_id/flashcards", flashcardHandler.GetFlashcardsBySetID)
		apiV1.GET("flashcardsets/:set_id", flashcardSetHandler.GetFlashcardSetByID)

		apiV1.GET("/users/:user_id/flashcardsets", flashcardSetHandler.GetFlashcardSets)
		apiV1.GET("/users/:user_id/flashcards-topic", flashcardHandler.GetFlashcardsByTopic)
		apiV1.GET("/users/:user_id/flashcards", flashcardHandler.GetAllUserFlashcards)

		apiV1.POST("/flashcards/generate", flashcardHandler.GenerateFlashcards)
		apiV1.POST("/flashcards/generate-from-summary", flashcardHandler.GenerateFlashcardsFromSummary)
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