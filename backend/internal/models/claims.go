package models

import "github.com/dgrijalva/jwt-go"

type Claims struct {
	Username string `json:"username"`
	UserID   int    `json:"user_id"`
	jwt.StandardClaims
}
