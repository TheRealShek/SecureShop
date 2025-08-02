package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetCart retrieves the user's cart
// TODO: Implement cart functionality
func GetCart(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Cart functionality coming soon",
		"items":   []interface{}{},
	})
}
