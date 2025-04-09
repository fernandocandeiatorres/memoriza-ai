package services

import (
	"context"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/google/uuid"
)

type FlashcardService interface {
    GenerateAndStoreFlashcards(ctx context.Context, frontsBacks []model.Flashcard, setID uuid.UUID) ([]model.Flashcard, error)
    GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error)
    GetFlashcardsByTopic(ctx context.Context, userID uuid.UUID, topic string) ([]model.Flashcard, error)
    GetAllUserFlashcards(ctx context.Context, userID uuid.UUID) ([]model.FlashcardSetWithFlashcards, error)
}

type flashcardService struct {
    repo repository.FlashcardRepository
    setRepo repository.FlashcardSetRepository
}

func NewFlashcardService(repo repository.FlashcardRepository, setRepo repository.FlashcardSetRepository) FlashcardService {
    return &flashcardService{repo: repo, setRepo: setRepo}
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

func (s *flashcardService) GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error) {
    return s.repo.GetAllBySetID(ctx, setID)
}

func (s *flashcardService) GetFlashcardsByTopic(ctx context.Context, userID uuid.UUID, topic string) ([]model.Flashcard, error) {
    return s.repo.GetFlashcardsByTopic(ctx, userID, topic)
}

func (s *flashcardService) GetAllUserFlashcards(ctx context.Context, userID uuid.UUID) ([]model.FlashcardSetWithFlashcards, error) {
	sets, err := s.setRepo.GetAllByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var result []model.FlashcardSetWithFlashcards

	for _, set := range sets {
		cards, err := s.repo.GetAllBySetID(ctx, set.ID)
		if err != nil {
			return nil, err
		}

		result = append(result, model.FlashcardSetWithFlashcards{
			ID:          set.ID.String(),
            UserID:      set.UserID.String(),
            Topic:       set.Topic,
            CreatedAt:   set.CreatedAt.Format("2006-01-02 15:04:05"),
            UpdatedAt:   set.UpdatedAt.Format("2006-01-02 15:04:05"),
			Flashcards:   cards,
		})
	}

	return result, nil
}
