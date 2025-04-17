package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/pkg/database"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

func GetAvailableProgrammingLanguages(w http.ResponseWriter, r *http.Request) {
	availableProgrammingLanguages := []string{"Go", "C++", "Python", "JavaScript",
		"Rust", "C#", "Java", "PHP", "Ruby", "Kotlin", "Swift", "C", "TypeScript", "Lua",
		"Haskell", "Lisp", "R", "Objective-C", "Scala", "Dart", "Elixir"}
	json.NewEncoder(w).Encode(availableProgrammingLanguages)
}

func CreateAlgorithm(w http.ResponseWriter, r *http.Request) {
	var algorithm models.Algorithm
	err := json.NewDecoder(r.Body).Decode(&algorithm)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if algorithm.Topic == "" ||
		algorithm.ProgrammingLanguage == "" ||
		algorithm.Title == "" ||
		algorithm.Code == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	algorithm.UserID = userID

	err = database.DB.QueryRow(
		`INSERT INTO algorithms(title, code, user_id, topic, programming_language, description)
			   VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
		algorithm.Title,
		algorithm.Code,
		algorithm.UserID,
		algorithm.Topic,
		algorithm.ProgrammingLanguage,
		algorithm.Description).
		Scan(&algorithm.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(algorithm)
}

func UpdateAlgorithm(w http.ResponseWriter, r *http.Request) {
	var updateAlgorithm models.Algorithm
	err := json.NewDecoder(r.Body).Decode(&updateAlgorithm)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if updateAlgorithm.Topic == "" ||
		updateAlgorithm.ProgrammingLanguage == "" ||
		updateAlgorithm.Title == "" ||
		updateAlgorithm.Code == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	id := mux.Vars(r)["id"]

	result, err := database.DB.Exec(
		`UPDATE algorithms
				SET title = $1, code = $2, topic = $3, programming_language = $4, description = $5
                WHERE id = $6 AND user_id = $7`,
		updateAlgorithm.Title,
		updateAlgorithm.Code,
		updateAlgorithm.Topic,
		updateAlgorithm.ProgrammingLanguage,
		updateAlgorithm.Description,
		id,
		userID)

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

	json.NewEncoder(w).Encode(updateAlgorithm)
}

func DeleteAlgorithm(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	userID := r.Context().Value("userID").(int)

	result, err := database.DB.Exec(
		`DELETE FROM algorithms WHERE user_id = $1 AND id = $2`,
		userID,
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
		http.Error(w, "Algorithm not found or you do not have permission to delete it", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetAlgorithms(w http.ResponseWriter, r *http.Request) {
	// Fetch algorithms from database only if is_private = FALSE OR user_id = userID
	thisUserID := r.Context().Value("userID").(int)

	algorithms, err := database.DB.Query(
		`SELECT id, title, code, user_id, topic, programming_language, description
				FROM algorithms
				WHERE is_private = FALSE OR user_id = $1`,
		thisUserID)

	if err != nil {
		http.Error(w, "Error fetching algorithms", http.StatusInternalServerError)
		return
	}
	defer algorithms.Close()

	var rows []map[string]interface{}
	for algorithms.Next() {
		var id int
		var title string
		var code string
		var userID int
		var topic string
		var programmingLanguage string
		var description string

		err = algorithms.Scan(&id, &title, &code, &userID, &topic, &programmingLanguage, &description)
		if err != nil {
			http.Error(w, "Error fetching algorithms", http.StatusInternalServerError)
			return
		}

		rows = append(rows, map[string]interface{}{
			"id":                   id,
			"title":                title,
			"code":                 code,
			"user_id":              userID,
			"topic":                topic,
			"programming_language": programmingLanguage,
			"description":          description,
		})
	}

	json.NewEncoder(w).Encode(rows)
}

func GetAlgorithmByID(w http.ResponseWriter, r *http.Request) {
	idStr, ok := mux.Vars(r)["id"]
	if !ok {
		http.Error(w, "Missing ID parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID parameter", http.StatusBadRequest)
		return
	}

	var algorithm models.Algorithm

	err = database.DB.QueryRow(
		`SELECT id, title, code, user_id, topic, programming_language, is_private, description
				FROM algorithms
				WHERE id = $1`,
		id).
		Scan(&algorithm.ID,
			&algorithm.Title,
			&algorithm.Code,
			&algorithm.UserID,
			&algorithm.Topic,
			&algorithm.ProgrammingLanguage,
			&algorithm.IsPrivate,
			&algorithm.Description,
		)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := r.Context().Value("userID").(int)

	if algorithm.IsPrivate && algorithm.UserID != userID {
		algorithm.Code = "PRIVATE!"
	}

	json.NewEncoder(w).Encode(algorithm)
}

func GetAlgorithmsByUserID(w http.ResponseWriter, r *http.Request) {
	var myAlgorithms []models.Algorithm

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Invalid userID", http.StatusBadRequest)
	}

	rows, err := database.DB.Query(
		`SELECT id, title, code, user_id, topic, programming_language, is_private, description
				FROM algorithms
				WHERE user_id = $1`,
		userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	defer rows.Close()

	for rows.Next() {
		var algorithm models.Algorithm
		err = rows.Scan(
			&algorithm.ID,
			&algorithm.Title,
			&algorithm.Code,
			&algorithm.UserID,
			&algorithm.Topic,
			&algorithm.ProgrammingLanguage,
			&algorithm.IsPrivate,
			&algorithm.Description,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		// не нужно если всегда userID - это наш
		if algorithm.IsPrivate && algorithm.UserID != userID {
			algorithm.Code = "PRIVATE!"
		}
		myAlgorithms = append(myAlgorithms, algorithm)
	}

	json.NewEncoder(w).Encode(myAlgorithms)
}

func GetAlgorithmsByFilter(w http.ResponseWriter, r *http.Request) {
	type filter struct {
		Topic               string `json:"topic"`
		ProgrammingLanguage string `json:"programming_language"`
		Title               string `json:"title"`
		AlgorithmID         int    `json:"id"`
		UserID              int    `json:"user_id"`
		SortBy              string `json:"sort_by"`
	}
	var filters filter

	params := r.URL.Query()

	filters.Title = params.Get("title")
	filters.Topic = params.Get("topic")
	filters.ProgrammingLanguage = params.Get("programming_language")
	filters.UserID, _ = strconv.Atoi(params.Get("user_id"))
	filters.AlgorithmID, _ = strconv.Atoi(params.Get("id"))
	filters.SortBy = params.Get("sort_by")

	thisUserID, _ := r.Context().Value("userID").(int)

	query := `SELECT id, title, code, user_id, topic, programming_language, description
				FROM algorithms
				WHERE is_private = FALSE OR user_id = $1`
	var args []interface{}
	args = append(args, thisUserID)
	argIndex := 2

	if filters.Topic != "" {
		query += fmt.Sprintf(" AND topic ILIKE $%d", argIndex)
		args = append(args, "%"+filters.Topic+"%")
		argIndex++
	}
	if filters.ProgrammingLanguage != "" {
		query += fmt.Sprintf(" AND programming_language ILIKE $%d", argIndex)
		args = append(args, "%"+filters.ProgrammingLanguage+"%")
		argIndex++
	}
	if filters.Title != "" {
		query += fmt.Sprintf(" AND title ILIKE $%d", argIndex)
		args = append(args, "%"+filters.Title+"%")
		argIndex++
	}
	if filters.AlgorithmID != 0 {
		query += fmt.Sprintf(" AND id=$%d", argIndex)
		args = append(args, filters.AlgorithmID)
		argIndex++
	}
	if filters.UserID != 0 {
		query += fmt.Sprintf(" AND user_id=$%d", argIndex)
		args = append(args, filters.UserID)
		argIndex++
	}
	if filters.SortBy != "" {
		switch filters.SortBy {
		case "newest":
			query += " ORDER BY created_at DESC"
		case "most_popular":
			query += " ORDER BY rating DESC" // Assuming you have a rating field
		default:
			query += " ORDER BY created_at DESC"
		}
	}

	rows, err := database.DB.Query(query, args...)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var algorithms []models.Algorithm

	for rows.Next() {
		var algorithm models.Algorithm

		err = rows.Scan(
			&algorithm.ID,
			&algorithm.Title,
			&algorithm.Code,
			&algorithm.UserID,
			&algorithm.Topic,
			&algorithm.ProgrammingLanguage,
			&algorithm.Description,
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		algorithms = append(algorithms, algorithm)
	}

	json.NewEncoder(w).Encode(algorithms)
}

func ChangeAlgorithmAvailability(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	userId := r.Context().Value("userID").(int)

	//log.Println("get request, ", id, userId)

	result, err := database.DB.Exec(
		`UPDATE algorithms
				SET is_private = NOT is_private
				WHERE user_id = $1 AND id = $2`,
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
	json.NewEncoder(w).Encode(map[string]string{"message": "Availability changed successfully"})
}
