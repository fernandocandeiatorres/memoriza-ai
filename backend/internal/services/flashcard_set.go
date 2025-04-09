package services

import (
	"context"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/google/uuid"
)

// FlashcardSetService define as operações para a camada de negócio do flashcard set.
type FlashcardSetService interface {
	// Create cria um novo flashcard set e retorna o ID criado.
	Create(ctx context.Context, set model.FlashcardSet) (uuid.UUID, error)
	// GetByID busca um flashcard set pelo ID.
	GetByID(ctx context.Context, setID uuid.UUID) (model.FlashcardSet, error)
}

type flashcardSetService struct {
	repo repository.FlashcardSetRepository
}

// NewFlashcardSetService cria uma nova instância de FlashcardSetService.
func NewFlashcardSetService(repo repository.FlashcardSetRepository) FlashcardSetService {
	return &flashcardSetService{repo: repo}
}

// Create chama o repositório para inserir o set no banco.
func (s *flashcardSetService) Create(ctx context.Context, set model.FlashcardSet) (uuid.UUID, error) {
	// Aqui você poderia colocar validações ou regras de negócio
	return s.repo.Create(ctx, &set)
}

// GetByID chama o repositório para recuperar um flashcard set.
func (s *flashcardSetService) GetByID(ctx context.Context, setID uuid.UUID) (model.FlashcardSet, error) {
	return s.repo.GetByID(ctx, setID)
}