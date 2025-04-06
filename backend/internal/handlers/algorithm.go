package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/pkg/database"
	"AlgorithmsOnlineLibrary/pkg/middleware"
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"strings"
)

// Handler to fetch programming languages
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

	if (algorithm.Topic == "") || (algorithm.ProgrammingLanguage == "") || (algorithm.Title == "") || (algorithm.Code == "") {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	algorithm.UserID = userID

	err = database.DB.QueryRow("INSERT INTO algorithms(title, code, user_id, topic, programming_language) VALUES($1, $2, $3, $4, $5) RETURNING id",
		algorithm.Title, algorithm.Code, algorithm.UserID, algorithm.Topic, algorithm.ProgrammingLanguage).Scan(&algorithm.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(algorithm)
}

func UpdateAlgorithm(w http.ResponseWriter, r *http.Request) {
	var updateAlgorithm models.Algorithm
	err := json.NewDecoder(r.Body).Decode(&updateAlgorithm)

	//log.Println("updateAlgorithm : ", updateAlgorithm)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if (updateAlgorithm.Topic == "") || (updateAlgorithm.ProgrammingLanguage == "") || (updateAlgorithm.Title == "") || (updateAlgorithm.Code == "") {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	id := mux.Vars(r)["id"]

	result, err := database.DB.Exec("UPDATE algorithms SET title = $1, code = $2, topic = $3, programming_language = $4 WHERE id = $5 AND user_id = $6",
		updateAlgorithm.Title, updateAlgorithm.Code, updateAlgorithm.Topic, updateAlgorithm.ProgrammingLanguage, id, userID)

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

	//log.Println("updating algo ends with success")

	json.NewEncoder(w).Encode(updateAlgorithm)
}

func GetAlgorithms(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")

	//log.Println("Authorization header:", authHeader)

	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims := &models.Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtKey, nil
	})

	//log.Println("claims", claims)
	//log.Println("token", token)

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	//log.Println("now we go to fetching algorithms")

	// Fetch algorithms from database
	algorithms, err := database.DB.Query("SELECT id, title, code, user_id, topic, programming_language FROM algorithms")
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

		err = algorithms.Scan(&id, &title, &code, &userID, &topic, &programmingLanguage)
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
		})
	}

	//log.Println("algorithms after fetching", rows)

	json.NewEncoder(w).Encode(rows)
}

func GetAlgorithmByID(w http.ResponseWriter, r *http.Request) {
	var algorithm models.Algorithm

	vars := mux.Vars(r)
	idStr, ok := vars["id"]

	if !ok {
		http.Error(w, "Missing ID parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID parameter", http.StatusBadRequest)
		return
	}

	//log.Println("id of fetching algorithm by id: ", id)

	err = database.DB.QueryRow("SELECT id, title, code, user_id, topic, programming_language FROM algorithms WHERE id = $1",
		id).Scan(&algorithm.ID, &algorithm.Title, &algorithm.Code, &algorithm.UserID, &algorithm.Topic, &algorithm.ProgrammingLanguage)

	//log.Println("algorithms after fetching by id", algorithm)
	//log.Println("error after fetching by id", err)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(algorithm)
}

func GetAlgorithmsByUserID(w http.ResponseWriter, r *http.Request) {
	var myAlgorithms []models.Algorithm

	userID, ok := r.Context().Value("userID").(int)
	if ok == false {
		http.Error(w, "Invalid userID", http.StatusBadRequest)
	}

	rows, err := database.DB.Query("SELECT id, title, code, user_id, topic, programming_language FROM algorithms WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	defer rows.Close()

	for rows.Next() {
		var algorithm models.Algorithm
		err = rows.Scan(&algorithm.ID, &algorithm.Title, &algorithm.Code, &algorithm.UserID, &algorithm.Topic, &algorithm.ProgrammingLanguage)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
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

	//log.Println("filters: ", filters)

	query := "SELECT id, title, code, user_id, topic, programming_language FROM algorithms WHERE 1=1"
	var args []interface{}
	var argIndex int = 1

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
		err = rows.Scan(&algorithm.ID, &algorithm.Title, &algorithm.Code, &algorithm.UserID, &algorithm.Topic, &algorithm.ProgrammingLanguage)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		algorithms = append(algorithms, algorithm)
	}

	json.NewEncoder(w).Encode(algorithms)
}
