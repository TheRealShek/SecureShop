package models

import "time"

// Product represents a product in the system
type Product struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Price       float64   `db:"price" json:"price"`
	Image       string    `db:"image" json:"image"`
	Stock       int       `db:"stock" json:"stock"`
	Status      string    `db:"status" json:"status"`
	SellerID    string    `db:"seller_id" json:"seller_id"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
