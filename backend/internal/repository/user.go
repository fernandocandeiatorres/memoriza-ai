package repository

import (
	"context"
	"database/sql"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/google/uuid"
)

type UserRepository interface {
	GetByID(ctx context.Context, userID uuid.UUID) (model.User, error)
	Create(ctx context.Context, user *model.User) error
	GetOrCreate(ctx context.Context, userID uuid.UUID, email string) (model.User, error)
}

type userRepo struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) GetByID(ctx context.Context, userID uuid.UUID) (model.User, error) {
	query := `SELECT id, email, password_hash, created_at, updated_at FROM users WHERE id = $1`
	var user model.User
	err := r.db.QueryRowContext(ctx, query, userID).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func (r *userRepo) Create(ctx context.Context, user *model.User) error {
	query := `INSERT INTO users (id, email, password_hash, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query, user.ID, user.Email, user.PasswordHash)
	return err
}

func (r *userRepo) GetOrCreate(ctx context.Context, userID uuid.UUID, email string) (model.User, error) {
	// Try to get existing user
	user, err := r.GetByID(ctx, userID)
	if err == nil {
		return user, nil
	}

	// If user doesn't exist, create it
	if err == sql.ErrNoRows {
		newUser := model.User{
			ID:           userID,
			Email:        email,
			PasswordHash: "", // No password hash needed for Supabase users
		}
		
		err = r.Create(ctx, &newUser)
		if err != nil {
			return model.User{}, err
		}
		
		// Get the created user with timestamps
		return r.GetByID(ctx, userID)
	}

	// Return other errors
	return model.User{}, err
} 