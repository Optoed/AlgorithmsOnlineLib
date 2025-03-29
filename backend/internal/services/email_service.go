package services

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"log"
	"os"
	"strconv"
)

func SendVerificationEmail(toEmail, username, verificationToken string) error {
	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPortStr := os.Getenv("SMTP_PORT")

	smtpPort, err := strconv.Atoi(smtpPortStr)
	if err != nil {
		log.Fatal(err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Email Verification")

	appURL := os.Getenv("APP_URL")
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", appURL, verificationToken)
	emailBody := fmt.Sprintf("Dear %s,\n\nTo verify your email, please visit the following link:\n%s"+
		"\n\n\nIf this is not your nickname, please do NOT follow this link, otherwise you will register another user who specified your email address.",
		username, verificationURL)
	m.SetBody("text/plain", emailBody)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)

	if err = d.DialAndSend(m); err != nil {
		log.Println("Failed to send email:", err)
	} else {
		log.Println("Email sent successfully")
	}

	return err
}

func SendResetPasswordEmail(toEmail, username, verificationToken string) error {
	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPortStr := os.Getenv("SMTP_PORT")

	smtpPort, err := strconv.Atoi(smtpPortStr)
	if err != nil {
		log.Fatal(err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Reset Password")

	log.Println(username)

	emailBody := fmt.Sprintf("Dear " + username + ",\n\nTo reset your password, please copy the following token and paste it into the app:\n" + verificationToken +
		"\n\n\nIf this is not your nickname, please do NOT follow this link.")
	m.SetBody("text/plain", emailBody)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)

	if err := d.DialAndSend(m); err != nil {
		log.Println("Failed to send email:", err)
	} else {
		log.Println("Email sent successfully")
	}

	return err
}
