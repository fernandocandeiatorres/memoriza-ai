package model

import "github.com/google/uuid"

type User struct {
	ID uuid.UUID `json:"id"`
	Email string `json:"email"`
	PasswordHash string `json:"-"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}