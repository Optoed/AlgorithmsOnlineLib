package config

import (
	"AlgorithmsOnlineLibrary/pkg/middleware"
	"github.com/joho/godotenv"
	"log"
	"os"
)

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// TODO: Load other configuration variables
	// Example:
	// dbUser := os.Getenv("DB_USER")
	// dbPassword := os.Getenv("DB_PASSWORD")

	middleware.JwtKey = []byte(os.Getenv("JWT_KEY"))
}
