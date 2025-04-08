package repository

import (
	"context"
	"database/sql"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
)

type FlashcardSetRepository interface {
    Create(ctx context.Context, fc *model.FlashcardSet) (int64, error)
    GetByID(ctx context.Context, setID int64) (model.FlashcardSet, error)
}

type flashcardSetRepo struct {
    db *sql.DB
}

func NewFlashcardSetRepository(db *sql.DB) FlashcardSetRepository {
    return &flashcardSetRepo{db: db}
}

func (r *flashcardSetRepo) Create(ctx context.Context, fcSet *model.FlashcardSet) (int64, error) {
    query := `INSERT INTO flashcards_set (user_id, topic, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW()) RETURNING id`
	var newID int64
    err := r.db.QueryRowContext(ctx, query, fcSet.UserID, fcSet.Topic).
        Scan(&fcSet.ID)
	newID = fcSet.ID
	return newID, err
}

func (r *flashcardSetRepo) GetByID(ctx context.Context, setID int64) (model.FlashcardSet, error) {
    query := `SELECT id, user_id, topic, created_at, updated_at FROM flashcards_set WHERE id = $1`
    var set model.FlashcardSet
	err := r.db.QueryRowContext(ctx, query, setID).
		Scan(&set.ID, &set.UserID, &set.Topic, &set.CreatedAt, &set.UpdatedAt)
	return set, err
}