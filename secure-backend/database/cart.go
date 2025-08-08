package database

import (
	"database/sql"
	"secure-backend/models"
)

// GetCartItems retrieves all cart items for a user with product details
func GetCartItems(userID string) ([]models.CartItemWithProduct, error) {
	var items []models.CartItemWithProduct
	query := `
		SELECT 
			ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at,
			p.id, p.name, p.description, p.price, p.image, p.stock, p.status, p.seller_id, p.created_at, p.updated_at
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = $1
		ORDER BY ci.created_at DESC`

	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.CartItemWithProduct
		err := rows.Scan(
			&item.ID, &item.UserID, &item.ProductID, &item.Quantity, &item.CreatedAt, &item.UpdatedAt,
			&item.Product.ID, &item.Product.Name, &item.Product.Description, &item.Product.Price,
			&item.Product.Image, &item.Product.Stock, &item.Product.Status, &item.Product.SellerID,
			&item.Product.CreatedAt, &item.Product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

// AddToCart adds a product to the user's cart or updates quantity if exists
func AddToCart(userID, productID string, quantity int) (*models.CartItem, error) {
	// First check if item already exists
	var existingItem models.CartItem
	err := DB.Get(&existingItem, `
		SELECT id, user_id, product_id, quantity, created_at, updated_at 
		FROM cart_items 
		WHERE user_id = $1 AND product_id = $2
	`, userID, productID)

	if err == sql.ErrNoRows {
		// Item doesn't exist, create new
		query := `
			INSERT INTO cart_items (user_id, product_id, quantity)
			VALUES ($1, $2, $3)
			RETURNING id, user_id, product_id, quantity, created_at, updated_at`

		var newItem models.CartItem
		err = DB.QueryRow(query, userID, productID, quantity).Scan(
			&newItem.ID, &newItem.UserID, &newItem.ProductID, &newItem.Quantity,
			&newItem.CreatedAt, &newItem.UpdatedAt,
		)
		return &newItem, err
	} else if err != nil {
		return nil, err
	}

	// Item exists, update quantity
	_, err = DB.Exec(`
		UPDATE cart_items 
		SET quantity = quantity + $1, updated_at = now()
		WHERE user_id = $2 AND product_id = $3
	`, quantity, userID, productID)

	if err != nil {
		return nil, err
	}

	// Return updated item
	err = DB.Get(&existingItem, `
		SELECT id, user_id, product_id, quantity, created_at, updated_at 
		FROM cart_items 
		WHERE user_id = $1 AND product_id = $2
	`, userID, productID)

	return &existingItem, err
}

// UpdateCartItemQuantity updates the quantity of a specific cart item
func UpdateCartItemQuantity(cartItemID, userID string, quantity int) error {
	if quantity <= 0 {
		// If quantity is 0 or negative, remove the item
		return RemoveFromCart(cartItemID, userID)
	}

	result, err := DB.Exec(`
		UPDATE cart_items 
		SET quantity = $1, updated_at = now()
		WHERE id = $2 AND user_id = $3
	`, quantity, cartItemID, userID)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// RemoveFromCart removes a specific item from the user's cart
func RemoveFromCart(cartItemID, userID string) error {
	result, err := DB.Exec(`
		DELETE FROM cart_items 
		WHERE id = $1 AND user_id = $2
	`, cartItemID, userID)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// ClearCart removes all items from the user's cart
func ClearCart(userID string) error {
	_, err := DB.Exec(`DELETE FROM cart_items WHERE user_id = $1`, userID)
	return err
}

// GetCartItemCount returns the total number of items in user's cart
func GetCartItemCount(userID string) (int, error) {
	var count int
	err := DB.Get(&count, `
		SELECT COALESCE(SUM(quantity), 0) 
		FROM cart_items 
		WHERE user_id = $1
	`, userID)
	return count, err
}
