package models

import "time"

// TODO: добавить поле difficulty, которое будет определять встроенный ИИ (в начале сложность передается просто в json)
type Algorithm struct {
	ID                  int       `json:"id"`
	Title               string    `json:"title"`
	Code                string    `json:"code"`
	UserID              int       `json:"user_id"`
	Topic               string    `json:"topic"`
	ProgrammingLanguage string    `json:"programming_language"`
	CreatedAt           time.Time `json:"created_at"`
}
