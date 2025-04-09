package repository

import (
	"context"
	"database/sql"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/google/uuid"
)

type FlashcardSetRepository interface {
    Create(ctx context.Context, fc *model.FlashcardSet) (uuid.UUID, error)
    GetByID(ctx context.Context, setID uuid.UUID) (model.FlashcardSet, error)
	GetAllByUserID(ctx context.Context, userID uuid.UUID) ([]model.FlashcardSet, error)
}

type flashcardSetRepo struct {
    db *sql.DB
}

func NewFlashcardSetRepository(db *sql.DB) FlashcardSetRepository {
    return &flashcardSetRepo{db: db}
}

func (r *flashcardSetRepo) Create(ctx context.Context, fcSet *model.FlashcardSet) (uuid.UUID, error) {
    query := `INSERT INTO flashcard_sets (user_id, topic, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW()) RETURNING id`
	var newID uuid.UUID
    err := r.db.QueryRowContext(ctx, query, fcSet.UserID, fcSet.Topic).
        Scan(&fcSet.ID)
	newID = fcSet.ID
	return newID, err
}

func (r *flashcardSetRepo) GetByID(ctx context.Context, setID uuid.UUID) (model.FlashcardSet, error) {
    query := `SELECT id, user_id, topic, created_at, updated_at FROM flashcard_sets WHERE id = $1`
    var set model.FlashcardSet
	err := r.db.QueryRowContext(ctx, query, setID).
		Scan(&set.ID, &set.UserID, &set.Topic, &set.CreatedAt, &set.UpdatedAt)
	return set, err
}

func (r *flashcardSetRepo) GetAllByUserID(ctx context.Context, userID uuid.UUID) ([]model.FlashcardSet, error) {
	query := `SELECT id, user_id, topic, created_at, updated_at FROM flashcard_sets WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sets []model.FlashcardSet
	for rows.Next() {
		var set model.FlashcardSet
		if err := rows.Scan(&set.ID, &set.UserID, &set.Topic, &set.CreatedAt, &set.UpdatedAt); err != nil {
			return nil, err
		}
		sets = append(sets, set)
	}

	return sets, nil
}

