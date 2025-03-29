package main

import (
	"AlgorithmsOnlineLibrary/internal/routes"
	"AlgorithmsOnlineLibrary/pkg/config"
	"AlgorithmsOnlineLibrary/pkg/database"
	"fmt"
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
	fmt.Println("Starting the app")

	// load configs
	config.LoadConfig()

	// initialize database
	database.InitDB()
	defer database.DB.Close()

	// initialize router
	router := mux.NewRouter()

	// setup routes
	routes.SetupRouters(router)

	// Создаем новый CORS middleware с настройками по умолчанию
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Разрешаем все origins (для разработки); лучше ограничить в продакшн
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Используем CORS middleware для всех запросов
	handler := c.Handler(router)

	fmt.Println("Server is running on port 8081")
	log.Fatal(http.ListenAndServe(":8081", handler))
}
