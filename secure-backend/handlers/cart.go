package handlers

import (
	"database/sql"
	"net/http"
	"secure-backend/database"
	"secure-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetCart retrieves the user's cart items with product details
func GetCart(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	items, err := database.GetCartItems(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"count": len(items),
	})
}

// AddToCart adds a product to the user's cart
func AddToCart(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var request struct {
		ProductID string `json:"product_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify product exists and is available
	product, err := database.GetProductByID(request.ProductID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify product"})
		return
	}

	// Check if product is published and has sufficient stock
	if product.Status != "published" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product is not available"})
		return
	}

	if product.Stock < request.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	// Add to cart
	cartItem, err := database.AddToCart(user.ID, request.ProductID, request.Quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
		return
	}

	c.JSON(http.StatusCreated, cartItem)
}

// UpdateCartItem updates the quantity of a cart item
func UpdateCartItem(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	cartItemID := c.Param("id")
	if cartItemID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart item ID is required"})
		return
	}

	var request struct {
		Quantity int `json:"quantity" binding:"required,min=0"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = database.UpdateCartItemQuantity(cartItemID, user.ID, request.Quantity)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated successfully"})
}

// RemoveCartItem removes an item from the user's cart
func RemoveCartItem(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	cartItemID := c.Param("id")
	if cartItemID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart item ID is required"})
		return
	}

	err = database.RemoveFromCart(cartItemID, user.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove cart item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item removed successfully"})
}

// ClearCart removes all items from the user's cart
func ClearCart(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = database.ClearCart(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}

// GetCartCount returns the total number of items in user's cart
func GetCartCount(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	count, err := database.GetCartItemCount(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}
