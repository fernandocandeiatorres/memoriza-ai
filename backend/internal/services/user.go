package services

import (
	"context"
	"database/sql"
	"errors"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/google/uuid"
)

var (
	ErrInsufficientCredits = errors.New("insufficient credits")
)

type UserService interface {
	GetByID(ctx context.Context, userID uuid.UUID) (model.User, error)
	EnsureUserExists(ctx context.Context, userID uuid.UUID, email string) (model.User, error)
	HasSufficientCredits(ctx context.Context, userID uuid.UUID, required int) (bool, error)
	ConsumeCredits(ctx context.Context, userID uuid.UUID, amount int) error
	GetUserCredits(ctx context.Context, userID uuid.UUID) (int, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetByID(ctx context.Context, userID uuid.UUID) (model.User, error) {
	return s.repo.GetByID(ctx, userID)
}

func (s *userService) EnsureUserExists(ctx context.Context, userID uuid.UUID, email string) (model.User, error) {
	return s.repo.GetOrCreate(ctx, userID, email)
}

func (s *userService) HasSufficientCredits(ctx context.Context, userID uuid.UUID, required int) (bool, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return false, err
	}
	return user.Credits >= required, nil
}

func (s *userService) ConsumeCredits(ctx context.Context, userID uuid.UUID, amount int) error {
	err := s.repo.DecrementCredits(ctx, userID, amount)
	if err == sql.ErrNoRows {
		return ErrInsufficientCredits
	}
	return err
}

func (s *userService) GetUserCredits(ctx context.Context, userID uuid.UUID) (int, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return 0, err
	}
	return user.Credits, nil
} 