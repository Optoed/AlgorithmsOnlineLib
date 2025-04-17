package services

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/internal/repositories"
	"AlgorithmsOnlineLibrary/internal/utils"
	"AlgorithmsOnlineLibrary/pkg/database"
	"errors"
	"net/http"
)

type UserService struct {
	repo *repositories.UserRepo
}

func NewUserService(repo *repositories.UserRepo) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(user *models.User) (int, error) {
	if user.Username == "" || user.Password == "" || user.Email == "" {
		return http.StatusBadRequest, errors.New("all fields (username, password, email) must be provided")
	}

	existsUsername, err := s.repo.CheckUserByUsername(user.Username)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if existsUsername {
		return http.StatusBadRequest, errors.New("user with such username already exists")
	}

	existsConfirmedEmail, err := s.repo.CheckUserByConfirmedEmail(user.Email)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if existsConfirmedEmail {
		return http.StatusBadRequest, errors.New("user with such email already exists")
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if user.Role == "" {
		user.Role = "user"
	}

	userID, err := s.repo.Create(user, hashedPassword)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	// Генерируем токен верификации
	verificationToken, err := utils.GenerateResetToken()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	var existUserWithToken bool
	err = database.DB.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM email_verification_tokens WHERE user_id = $1)`,
		user.ID).
		Scan(&existUserWithToken)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if existUserWithToken {
		_, err = database.DB.Exec(`DELETE FROM email_verification_tokens WHERE user_id = $1`, user.ID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	_, err = database.DB.Exec(
		`INSERT INTO email_verification_tokens(user_id, token, email, username)
				VALUES($1, $2, $3, $4)`,
		user.ID,
		verificationToken,
		user.Email,
		user.Username)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = services.SendVerificationEmail(user.Email, user.Username, verificationToken)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user.Password = "" // Очищаем пароль перед возвратом данных пользователю

	return http.StatusOK, nil
}
