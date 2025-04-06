package models

import "time"

type Algorithm struct {
	ID                  int    `json:"id"`
	Code                string `json:"code"`
	ProgrammingLanguage string `json:"programming_language"`
	Title               string `json:"title"`
	Topic               string `json:"topic"`
	UserID              int    `json:"user_id"`

	IsFavorite  bool      `json:"is_favorite"`
	IsPrivate   bool      `json:"is_private"`
	CreatedAt   time.Time `json:"created_at"`
	Description string    `json:"description"`

	Rating float64 `json:"rating"`
}
