package database

import (
	"secure-backend/models"
)

// GetProductsBySeller returns all products for a specific seller
func GetProductsBySeller(sellerID string) ([]models.Product, error) {
	var products []models.Product
	err := DB.Select(&products, "SELECT * FROM products WHERE seller_id = $1", sellerID)
	return products, err
}

// GetAllProducts returns all products (admin only)
func GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := DB.Select(&products, "SELECT * FROM products")
	return products, err
}

// GetPublishedProducts returns all published products (for buyers)
func GetPublishedProducts() ([]models.Product, error) {
	var products []models.Product
	err := DB.Select(&products, "SELECT * FROM products WHERE status = 'published'")
	return products, err
}

// CreateProduct creates a new product
func CreateProduct(product *models.Product) error {
	query := `
		INSERT INTO products (name, description, price, image, stock, status, seller_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	return DB.QueryRow(
		query,
		product.Name,
		product.Description,
		product.Price,
		product.Image,
		product.Stock,
		product.Status,
		product.SellerID,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)
}
