package database

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"os"
	"time"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB_URL := os.Getenv("DB_URL")

	for range 5 {
		DB, err = sql.Open("postgres", DB_URL)
		if err == nil {
			err = DB.Ping()
			if err == nil {
				break
			}
		}
		time.Sleep(5 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	log.Println("Database initialized successfully!")
	return nil
}
