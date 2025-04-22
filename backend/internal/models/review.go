package models

import "time"

/*

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    algorithm_id INTEGER REFERENCES algorithms(id),
    rating DOUBLE PRECISION CHECK ( rating >= 1.0 AND rating <= 10.0) DEFAULT NULL,
    review TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

*/

type Review struct {
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	AlgorithmID int        `json:"algorithm_id"`
	Rating      *float64   `json:"rating"`
	ReviewText  *string    `json:"review_text"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}
