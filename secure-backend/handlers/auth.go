package handlers

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"secure-backend/utils"
)

var mockUsers = map[string]string{
	"user@example.com": "password123",
}

// Helper function to determine user role
func getUserRole(email string) string {
	if strings.Contains(email, "seller") {
		return "seller"
	}
	return "buyer"
}

func Login(c *gin.Context) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	if pw, ok := mockUsers[creds.Email]; !ok || pw != creds.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token, err := utils.GenerateJWT(creds.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	
	// Determine user role based on email
	role := getUserRole(creds.Email)
	
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"role":  role,
	})
}

func Signup(c *gin.Context) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	if _, exists := mockUsers[creds.Email]; exists {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}
	mockUsers[creds.Email] = creds.Password
	c.JSON(http.StatusCreated, gin.H{"message": "Signup successful"})
}

func Logout(c *gin.Context) {
	// For JWT, logout is handled client-side (just delete token)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func GetCart(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{
		"user": user,
		"cart": []string{"ProductA", "ProductB"}, // mock cart
	})
}
