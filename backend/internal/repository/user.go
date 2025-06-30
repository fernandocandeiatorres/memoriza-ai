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
	UpdateCredits(ctx context.Context, userID uuid.UUID, credits int) error
	DecrementCredits(ctx context.Context, userID uuid.UUID, amount int) error
}

type userRepo struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) GetByID(ctx context.Context, userID uuid.UUID) (model.User, error) {
	query := `SELECT id, email, password_hash, credits, created_at, updated_at FROM users WHERE id = $1`
	var user model.User
	err := r.db.QueryRowContext(ctx, query, userID).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Credits, &user.CreatedAt, &user.UpdatedAt)
	return user, err
}

func (r *userRepo) Create(ctx context.Context, user *model.User) error {
	query := `INSERT INTO users (id, email, password_hash, credits, created_at, updated_at)
              VALUES ($1, $2, $3, $4, NOW(), NOW())`
	_, err := r.db.ExecContext(ctx, query, user.ID, user.Email, user.PasswordHash, user.Credits)
	return err
}

func (r *userRepo) GetOrCreate(ctx context.Context, userID uuid.UUID, email string) (model.User, error) {
	// Use a transaction to isolate this operation from concurrent queries
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return model.User{}, err
	}
	defer tx.Rollback() // Will be ignored if tx.Commit() is called

	// Use UPSERT to get or create user in a single query within transaction
	query := `
		INSERT INTO users (id, email, password_hash, credits, created_at, updated_at)
		VALUES ($1, $2, '', 1, NOW(), NOW())
		ON CONFLICT (id) 
		DO UPDATE SET 
			email = CASE WHEN users.email = '' OR users.email IS NULL THEN $2 ELSE users.email END,
			updated_at = NOW()
		RETURNING id, email, password_hash, credits, created_at, updated_at`
	
	var user model.User
	err = tx.QueryRowContext(ctx, query, userID, email).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Credits, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		return model.User{}, err
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return model.User{}, err
	}
	
	return user, nil
}

func (r *userRepo) UpdateCredits(ctx context.Context, userID uuid.UUID, credits int) error {
	query := `UPDATE users SET credits = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, credits, userID)
	return err
}

func (r *userRepo) DecrementCredits(ctx context.Context, userID uuid.UUID, amount int) error {
	query := `UPDATE users SET credits = credits - $1, updated_at = NOW() WHERE id = $2 AND credits >= $1`
	result, err := r.db.ExecContext(ctx, query, amount, userID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return sql.ErrNoRows // Indica que não há créditos suficientes
	}
	
	return nil
} 