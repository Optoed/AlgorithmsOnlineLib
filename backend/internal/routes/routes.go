package routes

import (
	"AlgorithmsOnlineLibrary/internal/handlers"
	"AlgorithmsOnlineLibrary/pkg/middleware"
	"github.com/gorilla/mux"
)

func SetupRouters(router *mux.Router) {
	router.HandleFunc("/register", handlers.Register).Methods("POST")
	router.HandleFunc("/verify-email", handlers.VerifyEmail).Methods("GET")
	router.HandleFunc("/login", handlers.Login).Methods("POST")

	router.HandleFunc("/forgot-password", handlers.ForgotPassword).Methods("POST")
	router.HandleFunc("/reset-password", handlers.ResetPassword).Methods("POST")

	protectedRoutes := router.PathPrefix("/api").Subrouter()
	protectedRoutes.Use(middleware.Authenticate)

	protectedRoutes.HandleFunc("/change-password", handlers.ChangePassword).Methods("PUT")

	protectedRoutes.HandleFunc("/available-programming-languages", handlers.GetAvailableProgrammingLanguages).Methods("GET")

	// algorithms
	protectedRoutes.HandleFunc("/algorithms", handlers.CreateAlgorithm).Methods("POST")
	protectedRoutes.HandleFunc("/algorithms/{id}", handlers.UpdateAlgorithm).Methods("PUT")
	protectedRoutes.HandleFunc("/algorithms/{id}", handlers.DeleteAlgorithm).Methods("DELETE")
	protectedRoutes.HandleFunc("/algorithms/search", handlers.GetAlgorithmsByFilter).Methods("GET")
	protectedRoutes.HandleFunc("/algorithms", handlers.GetAlgorithms).Methods("GET")
	protectedRoutes.HandleFunc("/algorithms/{id}", handlers.GetAlgorithmByID).Methods("GET")
	protectedRoutes.HandleFunc("/algorithms-by-user/{id}", handlers.GetAlgorithmsByUserID).Methods("GET")
}
