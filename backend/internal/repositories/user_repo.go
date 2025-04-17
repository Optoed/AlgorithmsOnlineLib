package repositories

import (
	"AlgorithmsOnlineLibrary/internal/models"
	"AlgorithmsOnlineLibrary/pkg/database"
	"database/sql"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) CheckUserByUsername(username string) (bool, error) {
	var existsUsername bool

	err := r.db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`,
		username).
		Scan(&existsUsername)

	return existsUsername, err
}

func (r *UserRepo) CheckUserByConfirmedEmail(email string) (bool, error) {
	var existsConfirmedEmail bool

	err := database.DB.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND confirmed = true)`,
		email).
		Scan(&existsConfirmedEmail)

	return existsConfirmedEmail, err
}

func (r *UserRepo) Create(user *models.User, hashedPassword string) (int, error) {
	err := r.db.QueryRow(
		`INSERT INTO users(username, password_hash, email, role)
				VALUES($1, $2, $3, $4)
				RETURNING id`,
		user.Username,
		hashedPassword,
		user.Email,
		user.Role).
		Scan(&user.ID)

	if err != nil {
		return 0, err
	}

	return user.ID, nil
}
