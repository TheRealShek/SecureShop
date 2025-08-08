package database

import (
	"errors"
	"secure-backend/models"
)

// GetUserByID retrieves a user by their ID
func GetUserByID(id string) (*models.User, error) {
	var user models.User
	err := DB.Get(&user, `SELECT id, email, role FROM users WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by their email
func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := DB.Get(&user, `SELECT id, email, role FROM users WHERE email = $1`, email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserRole fetches a user's role from the users table
func GetUserRole(userID string) (string, error) {
	var role string
	err := DB.Get(&role, "SELECT role FROM users WHERE id = $1", userID)
	if err != nil && err.Error() == "sql: no rows in result set" {
		// If no user is found, this is an error - user should exist
		return "", errors.New("user not found")
	}
	if err != nil {
		return "", err
	}
	return role, nil
}
