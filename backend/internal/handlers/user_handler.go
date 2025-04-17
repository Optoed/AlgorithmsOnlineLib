package handlers

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/internal/services"
	"AlgorithmsOnlineLibrary/internal/utils"
	"AlgorithmsOnlineLibrary/pkg/database"
	"AlgorithmsOnlineLibrary/pkg/middleware"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resultHttpStatus, err := h.service.Register(&user)

	if err != nil {
		http.Error(w, err.Error(), resultHttpStatus)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Registration successful, please check your email to verify your account",
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var creds models.User
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	//log.Println("creds while login = ", creds)

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

	//log.Println("result data of login: ", tokenString, storedUser)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"token":   tokenString,
		"userID":  strconv.Itoa(storedUser.ID),
	})
}
