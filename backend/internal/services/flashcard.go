package services

import (
	"context"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/google/uuid"
)

type FlashcardService interface {
    GenerateAndStoreFlashcards(ctx context.Context, frontsBacks []model.Flashcard, setID uuid.UUID) ([]model.Flashcard, error)
}

type flashcardService struct {
    repo repository.FlashcardRepository
}

func NewFlashcardService(repo repository.FlashcardRepository) FlashcardService {
    return &flashcardService{repo: repo}
}

// Este método recebe uma lista de flashcards (apenas com os dados de front/back) e atribui 
// ordem, setID e persiste cada um.
func (s *flashcardService) GenerateAndStoreFlashcards(ctx context.Context, cards []model.Flashcard, setID uuid.UUID) ([]model.Flashcard, error) {
    var result []model.Flashcard
    for i, card := range cards {
        card.FlashcardSetID = setID
        card.CardOrder = i + 1
        if err := s.repo.Create(ctx, &card); err != nil {
            return nil, err
        }
        result = append(result, card)
    }
    return result, nil
}