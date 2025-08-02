package models

// Product represents a product in the system
type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Image       string  `json:"image"`
	SellerID    string  `json:"seller_id"`
}
