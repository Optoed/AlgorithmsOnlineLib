package main

import (
	"AlgorithmsOnlineLibrary/internal/handlers"
	"AlgorithmsOnlineLibrary/internal/repositories"
	"AlgorithmsOnlineLibrary/internal/routes"
	"AlgorithmsOnlineLibrary/internal/services"
	"AlgorithmsOnlineLibrary/pkg/config"
	"AlgorithmsOnlineLibrary/pkg/database"
	"github.com/gorilla/mux"
	_ "github.com/joho/godotenv"
	_ "github.com/lib/pq" // Важно: импортируем драйвер PostgreSQL, обязательно ставим _
	"github.com/rs/cors"
	_ "github.com/rs/cors"
	"log"
	"net/http"
	_ "net/smtp"
)

func main() {
	log.Println("Starting the app")

	config.LoadConfig()

	err := database.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// repo, service, handler for User
	userRepo := repositories.NewUserRepo(database.DB)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := mux.NewRouter()

	routes.SetupRouters(router)

	// Создаем новый CORS middleware с настройками по умолчанию
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Разрешаем все origins (для разработки); лучше ограничить в продакшн
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Используем CORS middleware для всех запросов
	handler := c.Handler(router)

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
