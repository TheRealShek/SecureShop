package utils

import (
	"errors"
	"secure-backend/models"

	"github.com/gin-gonic/gin"
)

var (
	ErrNotAuthenticated = errors.New("user not authenticated")
	ErrInvalidUserType  = errors.New("invalid user type in context")
)

// GetAuthUser safely extracts the authenticated user from the gin.Context
func GetAuthUser(c *gin.Context) (*models.AuthUser, error) {
	userAny, exists := c.Get("user")
	if !exists {
		return nil, ErrNotAuthenticated
	}

	user, ok := userAny.(*models.AuthUser)
	if !ok {
		return nil, ErrInvalidUserType
	}

	return user, nil
}

// RequireRole checks if the authenticated user has the required role
func RequireRole(c *gin.Context, roles ...string) (*models.AuthUser, error) {
	user, err := GetAuthUser(c)
	if err != nil {
		return nil, err
	}

	for _, role := range roles {
		if user.Role == role {
			return user, nil
		}
	}

	return nil, errors.New("forbidden: insufficient role")
}

// IsSeller checks if the authenticated user is a seller
func IsSeller(c *gin.Context) bool {
	user, err := GetAuthUser(c)
	return err == nil && user.Role == "seller"
}

// IsBuyer checks if the authenticated user is a buyer
func IsBuyer(c *gin.Context) bool {
	user, err := GetAuthUser(c)
	return err == nil && user.Role == "buyer"
}

// IsAdmin checks if the authenticated user is an admin
func IsAdmin(c *gin.Context) bool {
	user, err := GetAuthUser(c)
	return err == nil && user.Role == "admin"
}
