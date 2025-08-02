package database

import (
	"secure-backend/models"
)

// GetProductByID retrieves a single product by its ID
func GetProductByID(id string) (*models.Product, error) {
	var product models.Product
	err := DB.Get(&product, `
		SELECT id, name, description, price, image, seller_id 
		FROM products 
		WHERE id = $1
	`, id)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// UpdateProduct updates an existing product
func UpdateProduct(product *models.Product) error {
	_, err := DB.Exec(`
		UPDATE products 
		SET name = $1, description = $2, price = $3, image = $4
		WHERE id = $5 AND seller_id = $6
	`, product.Name, product.Description, product.Price,
		product.Image, product.ID, product.SellerID)
	return err
}

// DeleteProduct deletes a product by ID and seller ID
func DeleteProduct(productID string, sellerID string) (int64, error) {
	result, err := DB.Exec(`
		DELETE FROM products 
		WHERE id = $1 AND seller_id = $2
	`, productID, sellerID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// GetProductBySeller retrieves a product ensuring it belongs to the specified seller
func GetProductBySeller(productID string, sellerID string) (*models.Product, error) {
	var product models.Product
	err := DB.Get(&product, `
		SELECT id, seller_id 
		FROM products 
		WHERE id = $1 AND seller_id = $2
	`, productID, sellerID)
	if err != nil {
		return nil, err
	}
	return &product, nil
}
