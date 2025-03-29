package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/internal/services"
	"AlgorithmsOnlineLibrary/internal/utils"
	"AlgorithmsOnlineLibrary/pkg/database"
	"AlgorithmsOnlineLibrary/pkg/middleware"
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"net/http"
	"strconv"
	"time"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if user.Username == "" || user.Password == "" || user.Email == "" {
		http.Error(w, "All fields (username, password, email) must be provided", http.StatusBadRequest)
		return
	}

	if user.Password == user.Username || len(user.Password) < 4 {
		http.Error(w, "Password is too weak", http.StatusBadRequest)
		return
	}
	user.Role = "user"

	var exists bool
	err = database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", user.Username).Scan(&exists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}

	//log.Println("we are here : before checking confirmed email")

	var existsConfirmedEmail bool
	err = database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND confirmed = true)", user.Email).Scan(&existsConfirmedEmail)
	//log.Println("we are here : after checking confirmed email")
	//log.Println("error: ", err)
	//log.Println("existsConfirmedEmail: ", existsConfirmedEmail)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if existsConfirmedEmail {
		http.Error(w, "User with this email already exists", http.StatusBadRequest)
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//log.Println("we are here : before inserting user")

	err = database.DB.QueryRow("INSERT INTO users(username, password_hash, email, role) VALUES($1, $2, $3, $4) RETURNING id",
		user.Username, hashedPassword, user.Email, user.Role).Scan(&user.ID)
	//log.Println("we are here : after inserting user")
	//log.Println("error: ", err)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Генерируем токен верификации
	verificationToken, err := utils.GenerateResetToken()
	//log.Println("verificationToken: ", verificationToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var existUserWithToken bool
	err = database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM email_verification_tokens WHERE user_id = $1)", user.ID).Scan(&existUserWithToken)
	//log.Println("existUserWithToken: ", existUserWithToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if existUserWithToken {
		//log.Println("User already have token")
		_, err = database.DB.Exec("DELETE FROM email_verification_tokens WHERE user_id = $1", user.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	_, err = database.DB.Exec("INSERT INTO email_verification_tokens(user_id, token, email, username) VALUES($1, $2, $3, $4)", user.ID, verificationToken, user.Email, user.Username)
	//log.Println("error: ", err)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = services.SendVerificationEmail(user.Email, user.Username, verificationToken)
	//log.Println("error: ", err)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user.Password = "" // Очищаем пароль перед возвратом данных пользователю
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful, please check your email to verify your account"})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var creds models.User
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var storedUser models.User
	var confirmed bool = false
	err = database.DB.QueryRow("SELECT id, username, password_hash, confirmed FROM users WHERE username=$1", creds.Username).
		Scan(&storedUser.ID, &storedUser.Username, &storedUser.Password, &confirmed)
	if err != nil {
		http.Error(w, "Invalid username", http.StatusUnauthorized)
		return
	}

	if !confirmed {
		http.Error(w, "Please verify your email before logging in", http.StatusUnauthorized)
		return
	}

	if !utils.CheckPasswordHash(creds.Password, storedUser.Password) {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(time.Hour)
	claims := &models.Claims{
		Username: storedUser.Username,
		UserID:   storedUser.ID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(middleware.JwtKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//http.SetCookie(w, &http.Cookie{
	//	Name:    "token",
	//	Value:   tokenString,
	//	Expires: expirationTime,
	//})

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"token":   tokenString,
		"userID":  strconv.Itoa(storedUser.ID),
	})
}
