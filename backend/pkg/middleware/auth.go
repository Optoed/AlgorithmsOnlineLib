package middleware

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"context"
	"errors"
	"github.com/dgrijalva/jwt-go"
	"net/http"
	"strings"
)

var JwtKey []byte

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Получаем заголовок Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Извлекаем токен из заголовка Authorization
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader { // проверяем, что токен корректно извлечен
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims := &models.Claims{}

		tkn, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		})
		if err != nil {
			if errors.Is(err, jwt.ErrSignatureInvalid) {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if !tkn.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		r = r.WithContext(context.WithValue(r.Context(), "userID", claims.UserID))
		next.ServeHTTP(w, r)
	})
}
