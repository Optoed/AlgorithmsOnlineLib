package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/pkg/database"
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

// Rate TODO а нужен ли отдельный от review Rate?

func RateAlgorithm(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	rating, _ := strconv.ParseFloat(mux.Vars(r)["rating"], 64)
	userId := r.Context().Value("userID").(int)

	// TODO нужно проверить что алгоритм еще не был оценен конкретным пользователем

	var ratingResponse struct {
		rating     float64 `db:"raring" json:"rating"`
		countRated int     `db:"count_rated" json:"count_rated"`
	}

	_ = database.DB.QueryRow(
		`SELECT rating, count_rated FROM algorithms
				WHERE id = $1 AND user_id = $2`,
		id,
		userId).
		Scan(&ratingResponse.rating, &ratingResponse.countRated)

	newAvgRating := (ratingResponse.rating*float64(ratingResponse.countRated) + rating) / float64(ratingResponse.countRated+1)

	result, err := database.DB.Exec(
		`UPDATE algorithms
				SET rating = $1, count_rated = count_rated + 1
				WHERE user_id = $2 AND id = $3`,
		newAvgRating,
		userId,
		id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Algorithm not found or not owned by the user", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "IsFavorite status changed successfully"})
}

// REVIEW

func AddReview(w http.ResponseWriter, r *http.Request) {
	var review models.Review
	err := json.NewDecoder(r.Body).Decode(&review)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if review.Rating != nil && (*review.Rating < 1.0 || *review.Rating > 10.0) {
		http.Error(w, "Rating must be NULL or between 1.0 AND 10.0", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	review.UserID = userID

	_, err = database.DB.Exec(
		`INSERT INTO reviews (user_id, algorithm_id, rating, review_text)
			VALUES ($1, $2, $3, $4)`,
		review.UserID, review.AlgorithmID, review.Rating, review.ReviewText)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError) // TODO или StatusBadRequest
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Added Review successfully"})
}

func DeleteReview(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	algorithmID := mux.Vars(r)["algorithm_id"]
	userID := r.Context().Value("userID").(int)

	result, err := database.DB.Exec(
		`DELETE FROM reviews WHERE id = $1 AND user_id = $2 AND algorithm_id = $3`,
		id,
		userID,
		algorithmID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Review not found or you do not have permission to delete it", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func UpdateReview(w http.ResponseWriter, r *http.Request) {
	var updateReview models.Review
	err := json.NewDecoder(r.Body).Decode(&updateReview)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	algorithmID := r.Context().Value("algorithm_id").(int)
	id := mux.Vars(r)["id"]

	result, err := database.DB.Exec(
		`UPDATE reviews
				SET review_text = $1, rating = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND user_id = $4 AND algorithm_id = $5`,
		updateReview.ReviewText,
		updateReview.Rating,
		id,
		userID,
		algorithmID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "No rows were updated", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(updateReview)
}

func GetReviewsByAlgorithmID(w http.ResponseWriter, r *http.Request) {
	var reviews []models.Review

	algorithmID := mux.Vars(r)["algorithm_id"]

	rows, err := database.DB.Query(
		`SELECT id, user_id, review_text,rating ,created_at, updated_at
				FROM reviews
				WHERE algorithm_id = $1`,
		algorithmID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	defer rows.Close()

	for rows.Next() {
		var review models.Review
		err = rows.Scan(
			&review.ID,
			&review.ReviewText,
			&review.Rating,
			&review.UserID,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		reviews = append(reviews, review)
	}

	json.NewEncoder(w).Encode(reviews)
}

func GetReviewByAlgorithmIDandUserID(w http.ResponseWriter, r *http.Request) {
	var reviews []models.Review

	algorithmID := mux.Vars(r)["algorithm_id"]
	userID := r.Context().Value("userID")

	rows, err := database.DB.Query(
		`SELECT id,review_text,rating ,created_at, updated_at
				FROM reviews
				WHERE algorithm_id = $1 AND user_id = $2`,
		algorithmID,
		userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	defer rows.Close()

	for rows.Next() {
		var review models.Review
		err = rows.Scan(
			&review.ID,
			&review.ReviewText,
			&review.Rating,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		reviews = append(reviews, review)
	}

	json.NewEncoder(w).Encode(reviews)
}
