package main

import (
	"log"
	"os"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/database"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/handler"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	// 1. Inicializa a conexão com o banco de dados (Supabase/PostgreSQL).
	database.InitDB()

	// 2. Cria os repositórios, passando a instância do banco de dados.
	flashcardRepo := repository.NewFlashcardRepository(database.DB)
	flashcardSetRepo := repository.NewFlashcardSetRepository(database.DB)

	// 3. Cria os serviços, injetando os repositórios correspondentes.
	flashcardService := services.NewFlashcardService(flashcardRepo)
	flashcardSetService := services.NewFlashcardSetService(flashcardSetRepo)

	// 4. Cria os handlers, injetando os serviços que eles utilizarão.
	//    No handler de flashcards, estamos passando também o serviço do flashcard set,
	//    pois o fluxo de criação pode envolver a criação de um set.
	flashcardHandler := handler.NewFlashcardHandler(flashcardService, flashcardSetService)

	// 5. Inicializa o router do Gin e mapeia as rotas.
	router := gin.Default()
	router.POST("/flashcards/generate", flashcardHandler.GenerateFlashcards)

	// 6. Define a porta a partir de variável de ambiente (ou 8080 por padrão).
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Servidor rodando na porta %s", port)
	router.Run(":" + port)
}