package handlers

import (
	"net/http"
	"secure-backend/models"

	"github.com/gin-gonic/gin"
)

// GetUserInfo returns the authenticated user's information including their role
func GetUserInfo(c *gin.Context) {
	userAny, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, ok := userAny.(*models.AuthUser)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}
