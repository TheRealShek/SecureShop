package models

import "time"

// CartItem represents an item in a user's shopping cart
type CartItem struct {
	ID        string    `db:"id" json:"id"`
	UserID    string    `db:"user_id" json:"user_id"`
	ProductID string    `db:"product_id" json:"product_id"`
	Quantity  int       `db:"quantity" json:"quantity"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

// CartItemWithProduct represents a cart item with full product details
type CartItemWithProduct struct {
	CartItem
	Product Product `json:"product"`
}

// Order represents a customer order
type Order struct {
	ID              string    `db:"id" json:"id"`
	UserID          string    `db:"user_id" json:"user_id"`
	Status          string    `db:"status" json:"status"`
	TotalAmount     float64   `db:"total_amount" json:"total_amount"`
	ShippingAddress string    `db:"shipping_address" json:"shipping_address"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time `db:"updated_at" json:"updated_at"`
}

// OrderItem represents individual items within an order
type OrderItem struct {
	ID         string    `db:"id" json:"id"`
	OrderID    string    `db:"order_id" json:"order_id"`
	ProductID  string    `db:"product_id" json:"product_id"`
	Quantity   int       `db:"quantity" json:"quantity"`
	UnitPrice  float64   `db:"unit_price" json:"unit_price"`
	TotalPrice float64   `db:"total_price" json:"total_price"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

// OrderWithDetails represents an order with full product and user details
type OrderWithDetails struct {
	Order
	Items []OrderItemWithProduct `json:"items"`
	User  User                   `json:"user"`
}

// OrderItemWithProduct represents an order item with full product details
type OrderItemWithProduct struct {
	OrderItem
	Product Product `json:"product"`
}
