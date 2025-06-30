package repository

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
	"github.com/google/uuid"
)

type FlashcardRepository interface {
    Create(ctx context.Context, fc *model.Flashcard) error
    GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error)
    GetFlashcardsByTopic(ctx context.Context, userID uuid.UUID, topic string) ([]model.Flashcard, error)
    GetAllUserFlashcardsWithSets(ctx context.Context, userID uuid.UUID) (map[string][]model.Flashcard, map[string]model.FlashcardSet, error)
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
    
    err := r.db.QueryRowContext(ctx, query, fc.FlashcardSetID, fc.CardOrder, fc.QuestionText, fc.AnswerText).
        Scan(&fc.ID)
    
    return err
}

func (r *flashcardRepo) GetAllBySetID(ctx context.Context, setID uuid.UUID) ([]model.Flashcard, error) {
    // Use a simpler query without explicit casting to avoid prepared statement issues
    query := `SELECT id, flashcard_set_id, card_order, question_text, answer_text, created_at, updated_at 
              FROM flashcards 
              WHERE flashcard_set_id = $1 
              ORDER BY card_order`
    
    
    rows, err := r.db.QueryContext(ctx, query, setID)
    if err != nil {
        log.Printf("Error executing query: %v", err)
        return nil, err
    }
    defer rows.Close()

    var flashcards []model.Flashcard
    rowCount := 0
    for rows.Next() {
        rowCount++
        var fc model.Flashcard
        

        if err := rows.Scan(&fc.ID, &fc.FlashcardSetID, &fc.CardOrder, &fc.QuestionText, &fc.AnswerText, &fc.CreatedAt, &fc.UpdatedAt); err != nil {
            log.Printf("Error scanning row %d: %v", rowCount, err)
            return nil, err
        }
        
        flashcards = append(flashcards, fc)
    }
    
    // Check for errors during iteration
    if err = rows.Err(); err != nil {
        log.Printf("Error during row iteration: %v", err)
        return nil, err
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

// GetAllUserFlashcardsWithSets gets all flashcards for a user organized by sets using a single query
func (r *flashcardRepo) GetAllUserFlashcardsWithSets(ctx context.Context, userID uuid.UUID) (map[string][]model.Flashcard, map[string]model.FlashcardSet, error) {
	// Use transaction to isolate this complex query
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return nil, nil, err
	}
	defer tx.Rollback()

	query := `
		SELECT 
			fs.id as set_id, fs.user_id, fs.topic, fs.created_at as set_created_at, fs.updated_at as set_updated_at,
			COALESCE(f.id, '00000000-0000-0000-0000-000000000000') as flashcard_id, 
			COALESCE(f.card_order, 0) as card_order, 
			COALESCE(f.question_text, '') as question_text, 
			COALESCE(f.answer_text, '') as answer_text, 
			COALESCE(f.created_at, fs.created_at) as flashcard_created_at, 
			COALESCE(f.updated_at, fs.updated_at) as flashcard_updated_at
		FROM flashcard_sets fs
		LEFT JOIN flashcards f ON fs.id = f.flashcard_set_id
		WHERE fs.user_id = $1
		ORDER BY fs.created_at DESC, f.card_order ASC
	`

	rows, err := tx.QueryContext(ctx, query, userID)
	if err != nil {
		log.Printf("Error executing join query: %v", err)
		return nil, nil, err
	}
	defer rows.Close()

	flashcardsBySet := make(map[string][]model.Flashcard)
	sets := make(map[string]model.FlashcardSet)

	for rows.Next() {
		var setID, userIDStr, topic, setCreatedAt, setUpdatedAt string
		var flashcardID, questionText, answerText, flashcardCreatedAt, flashcardUpdatedAt string
		var cardOrder int

		err := rows.Scan(
			&setID, &userIDStr, &topic, &setCreatedAt, &setUpdatedAt,
			&flashcardID, &cardOrder, &questionText, &answerText, &flashcardCreatedAt, &flashcardUpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			return nil, nil, err
		}

		// Add set if not already added
		if _, exists := sets[setID]; !exists {
			setUUID, _ := uuid.Parse(setID)
			userUUID, _ := uuid.Parse(userIDStr)
			
			sets[setID] = model.FlashcardSet{
				ID:        setUUID,
				UserID:    userUUID,
				Topic:     topic,
				CreatedAt: parseTime(setCreatedAt),
				UpdatedAt: parseTime(setUpdatedAt),
			}
			flashcardsBySet[setID] = []model.Flashcard{}
		}

		// Add flashcard if it exists (not null from LEFT JOIN)
		if flashcardID != "00000000-0000-0000-0000-000000000000" && questionText != "" {
			flashcardUUID, _ := uuid.Parse(flashcardID)
			setUUID, _ := uuid.Parse(setID)

			flashcard := model.Flashcard{
				ID:             flashcardUUID,
				FlashcardSetID: setUUID,
				CardOrder:      cardOrder,
				QuestionText:   questionText,
				AnswerText:     answerText,
				CreatedAt:      parseTime(flashcardCreatedAt),
				UpdatedAt:      parseTime(flashcardUpdatedAt),
			}
			flashcardsBySet[setID] = append(flashcardsBySet[setID], flashcard)
		}
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
		return nil, nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, nil, err
	}

	return flashcardsBySet, sets, nil
}

// Helper function to parse time strings
func parseTime(timeStr string) time.Time {
	t, err := time.Parse("2006-01-02 15:04:05", timeStr)
	if err != nil {
		// Try with timezone
		t, err = time.Parse("2006-01-02T15:04:05Z07:00", timeStr)
		if err != nil {
			return time.Now() // fallback
		}
	}
	return t
}
