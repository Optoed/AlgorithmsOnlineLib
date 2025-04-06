package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/internal/services"
	"AlgorithmsOnlineLibrary/internal/utils"
	"AlgorithmsOnlineLibrary/pkg/database"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	token := vars.Get("token")

	//log.Println("token: ", token)

	var userID int
	var email string
	err := database.DB.QueryRow("SELECT user_id, email FROM email_verification_tokens WHERE token = $1", token).Scan(&userID, &email)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("UPDATE users SET confirmed = true WHERE id = $1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("DELETE FROM email_verification_tokens WHERE email = $1", email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("DELETE FROM users WHERE email = $1 AND confirmed = false", email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Email verified successfully"})
}

// ChangePassword Админ меняет пароль пользователю
// TODO: Доступ должен быть к этой функции только у админа
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if user.Username == "" || user.Password == "" || user.Email == "" || user.Role == "" {
		http.Error(w, "All fields (username, password, email, role) must be provided", http.StatusBadRequest)
		return
	}

	if user.Password == user.Username || len(user.Password) < 4 {
		http.Error(w, "Password is too weak", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("userID").(int)
	currentPasswordHash, err := utils.HashPassword(user.Password)
	result, err := database.DB.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", currentPasswordHash, userID)

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

	json.NewEncoder(w).Encode(map[string]string{"message": "Password changed"})
}

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error decoding request body:", err)
		return
	}

	var storedUser models.User
	err = database.DB.QueryRow("SELECT id, email, username FROM users WHERE username=$1", user.Username).Scan(&storedUser.ID, &storedUser.Email, &storedUser.Username)
	if err != nil {
		http.Error(w, "Invalid username", http.StatusUnauthorized)
		log.Println("Error fetching user from DB:", err)
		return
	}

	resetToken, err := utils.GenerateResetToken()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error generating reset token:", err)
		return
	}

	_, err = database.DB.Exec("DELETE FROM password_reset_tokens WHERE user_id = $1 AND email = $2", storedUser.ID, storedUser.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error deleting reset token into DB:", err)
		return
	}

	log.Println("user", user)

	_, err = database.DB.Exec("INSERT INTO password_reset_tokens(user_id, token, email, username, created_at) VALUES($1, $2, $3, $4, $5)",
		storedUser.ID, resetToken, storedUser.Email, storedUser.Username, time.Now())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error inserting reset token into DB:", err)
		return
	}

	log.Println("username", storedUser.Username)
	err = services.SendResetPasswordEmail(storedUser.Email, storedUser.Username, resetToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error sending reset email:", err)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Password reset email sent"})
	log.Println("Password reset email sent successfully to:", storedUser.Email)
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var RequestBody struct {
		Username    string `json:"username"`
		Email       string `json:"email"`
		Token       string `json:"token"`
		NewPassword string `json:"new-password"`
	}

	err := json.NewDecoder(r.Body).Decode(&RequestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var userID int
	err = database.DB.QueryRow("SELECT user_id FROM password_reset_tokens WHERE token=$1 AND username=$2 AND email=$3 AND created_at > $4",
		RequestBody.Token, RequestBody.Username, RequestBody.Email, time.Now().Add(-24*time.Hour)).Scan(&userID)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
		return
	}

	hashedPassword, err := utils.HashPassword(RequestBody.NewPassword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("UPDATE users SET password_hash=$1 WHERE id=$2", hashedPassword, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("DELETE FROM password_reset_tokens WHERE token=$1", RequestBody.Token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Password reset successful"})
}
