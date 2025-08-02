package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"secure-backend/database"
	"secure-backend/models"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// SupabaseAuthMiddleware validates Supabase Auth tokens and adds user info to context
func SupabaseAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		// Remove Bearer prefix
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
			return
		}

		// Get JWT secret from environment
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
		if jwtSecret == "" {
			log.Printf("SUPABASE_JWT_SECRET not set")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Authentication configuration error"})
			return
		}

		// Parse and validate the JWT
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify that the token uses the correct signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("Invalid token: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// Extract required claims
		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID in token"})
			return
		}

		// Get email from claims (optional)
		email, _ := claims["email"].(string)

		// Fetch user role from database
		role, err := database.GetUserRole(userID)
		if err != nil {
			log.Printf("Error fetching user role: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user data"})
			return
		}

		// Create user object and store in context
		user := &models.AuthUser{
			ID:    userID,
			Email: email,
			Role:  role,
		}

		c.Set("user", user)
		c.Next()
	}
}
