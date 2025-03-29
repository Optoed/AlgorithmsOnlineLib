.PHONY: init
# Initialize project structure
init:
	mkdir -p cmd internal/models internal/repositories internal/services internal/handlers internal/utils internal/routes pkg/config pkg/database pkg/middleware
	touch internal/handlers/auth.go internal/handlers/algorithm.go internal/handlers/email.go
	touch internal/models/user.go internal/models/algorithm.go internal/models/email.go
	touch internal/repositories/user_repo.go internal/repositories/algorithm_repo.go internal/repositories/email_repo.go
	touch internal/services/auth_service.go internal/services/algorithm_service.go internal/services/email_service.go
	touch internal/utils/bcrypt.go internal/utils/jwt.go internal/utils/email.go
	touch internal/routes/routes.go
	touch pkg/config/config.go pkg/database/database.go pkg/middleware/auth.go
	touch cmd/main.go