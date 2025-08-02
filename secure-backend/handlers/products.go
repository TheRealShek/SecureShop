package handlers

import (
	"database/sql"
	"net/http"
	"secure-backend/database"
	"secure-backend/models"
	"secure-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetProducts returns products based on user's role:
// - Buyers see all published products
// - Sellers see only their own products
// - Admins see all products
func GetProducts(c *gin.Context) {
	user, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var products []models.Product

	if utils.IsAdmin(c) {
		products, err = database.GetAllProducts()
	} else if utils.IsSeller(c) {
		products, err = database.GetProductsBySeller(user.ID)
	} else {
		products, err = database.GetPublishedProducts()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// CreateProduct allows sellers to create new products
func CreateProduct(c *gin.Context) {
	user, err := utils.RequireRole(c, "seller")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the seller ID from the authenticated user
	product.SellerID = user.ID

	// Save the product
	if err := database.CreateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// GetProduct handles retrieving a single product by ID
// Any authenticated user can view products
func GetProduct(c *gin.Context) {
	// Extract user info from context
	_, err := utils.GetAuthUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	// Get product ID from URL parameter
	productID := c.Param("id")
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
		return
	}

	// Get the product using database package
	product, err := database.GetProductByID(productID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	// Return the product
	c.JSON(http.StatusOK, product)
}

// UpdateProduct handles updating a product
// Only sellers can update their own products
func UpdateProduct(c *gin.Context) {
	// Extract user info and verify seller role
	user, err := utils.RequireRole(c, "seller")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Get product ID from URL parameter
	productID := c.Param("id")
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
		return
	}

	// Verify product belongs to seller
	_, err = database.GetProductBySeller(productID, user.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	// Bind update data
	var updateProduct models.Product
	if err := c.ShouldBindJSON(&updateProduct); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product data"})
		return
	}

	// Set the product ID and seller ID
	updateProduct.ID = productID
	updateProduct.SellerID = user.ID

	// Update the product
	err = database.UpdateProduct(&updateProduct)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
}

// DeleteProduct handles product deletion
// Only sellers can delete their own products
func DeleteProduct(c *gin.Context) {
	// Extract user info and verify seller role
	user, err := utils.RequireRole(c, "seller")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Get product ID from URL parameter
	productID := c.Param("id")
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
		return
	}

	// First verify the product exists and belongs to the seller
	_, err = database.GetProductBySeller(productID, user.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found or not owned by you"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	// Delete the product
	rowsAffected, err := database.DeleteProduct(productID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found or already deleted"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
