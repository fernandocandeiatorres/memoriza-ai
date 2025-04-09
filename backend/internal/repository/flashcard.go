package repository

import (
	"context"
	"database/sql"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/google/uuid"
)

type FlashcardRepository interface {
    Create(ctx context.Context, fc *model.Flashcard) error
    GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error)
    GetFlashcardsByTopic(ctx context.Context, userID uuid.UUID, topic string) ([]model.Flashcard, error)
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

func (r *flashcardRepo) GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error) {
    query := `SELECT id, flashcard_set_id, card_order, question_text, answer_text, created_at, updated_at FROM flashcards WHERE flashcard_set_id = $1 ORDER BY card_order`
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

// 4. Get all flashcards by topic (for a specific user)
func (r *flashcardRepo) GetFlashcardsByTopic(ctx context.Context, userID uuid.UUID, topic string) ([]model.Flashcard, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT f.id, f.flashcard_set_id, f.card_order, f.question_text, f.answer_text, f.created_at, f.updated_at
		FROM flashcards f
		JOIN flashcard_sets fs ON f.flashcard_set_id = fs.id
		WHERE fs.user_id = $1 AND fs.topic ILIKE $2
		ORDER BY f.card_order
	`, userID, topic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flashcards []model.Flashcard
	for rows.Next() {
		var f model.Flashcard
		err := rows.Scan(&f.ID, &f.FlashcardSetID, &f.CardOrder, &f.QuestionText, &f.AnswerText, &f.CreatedAt, &f.UpdatedAt)
		if err != nil {
			return nil, err
		}
		flashcards = append(flashcards, f)
	}
	return flashcards, nil
}
