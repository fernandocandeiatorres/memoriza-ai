package main

import (
	"log"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/api"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/database"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/handler"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/services"
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
	flashcardService := services.NewFlashcardService(flashcardRepo, flashcardSetRepo)
	flashcardSetService := services.NewFlashcardSetService(flashcardSetRepo)

	// 4. Cria os handlers, injetando os serviços que eles utilizarão.
	flashcardHandler := handler.NewFlashcardHandler(flashcardService, flashcardSetService)
	flashcardSetHandler := handler.NewFlashcardSetHandler(flashcardService, flashcardSetService)

	// 5. Setup Router
	router := api.SetupRouter(flashcardHandler, flashcardSetHandler)

	// 6. Inicia o servidor
	api.RunServer(router)
}