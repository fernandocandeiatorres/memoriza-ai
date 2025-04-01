package model

type User struct {
	ID int64 `json:"id"`
	Email string `json:"question_text"`
	Password string `json:"-"`
	CreatedAt string `json:"created_at"`
}