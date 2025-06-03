package services

import (
	"context"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/repository"
	"github.com/google/uuid"
)

type UserService interface {
	GetByID(ctx context.Context, userID uuid.UUID) (model.User, error)
	EnsureUserExists(ctx context.Context, userID uuid.UUID, email string) (model.User, error)
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