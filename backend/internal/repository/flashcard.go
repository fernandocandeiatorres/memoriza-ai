package repository

import (
	"context"
	"database/sql"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
)

type FlashcardRepository interface {
    Create(ctx context.Context, fc *model.Flashcard) error
    GetBySetID(ctx context.Context, setID int64) ([]model.Flashcard, error)
}

type flashcardRepo struct {
    db *sql.DB
}

func NewFlashcardRepository(db *sql.DB) FlashcardRepository {
    return &flashcardRepo{db: db}
}

func (r *flashcardRepo) Create(ctx context.Context, fc *model.Flashcard) error {
    query := `INSERT INTO flashcards (flashcard_set_id, card_order, question_text, answer_text, created_at, updated_at)
              VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`
    return r.db.QueryRowContext(ctx, query, fc.FlashcardSetID, fc.CardOrder, fc.QuestionText, fc.AnswerText).
        Scan(&fc.ID)
}

func (r *flashcardRepo) GetBySetID(ctx context.Context, setID int64) ([]model.Flashcard, error) {
    query := `SELECT id, flashcard_set_id, card_order, question_text, answer_text, created_at, updated_at FROM flashcards WHERE flashcard_set_id = $1`
    rows, err := r.db.QueryContext(ctx, query, setID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var flashcards []model.Flashcard
    for rows.Next() {
        var fc model.Flashcard
        if err := rows.Scan(&fc.ID, &fc.FlashcardSetID, &fc.CardOrder, &fc.QuestionText, &fc.AnswerText, &fc.CreatedAt, &fc.UpdatedAt); err != nil {
            return nil, err
        }
        flashcards = append(flashcards, fc)
    }
    return flashcards, nil
}
