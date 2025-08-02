package models

// User represents a user in the system
type User struct {
	ID       string `db:"id" json:"id"`
	Email    string `db:"email" json:"email"`
	Role     string `db:"role" json:"role"`
	Password string `db:"password" json:"-"` // Password hash, not exposed in JSON
}

// AuthUser represents an authenticated user with claims from Supabase JWT
type AuthUser struct {
	ID    string `json:"id"`    // Supabase user ID (auth.uid())
	Email string `json:"email"` // User's email address
	Role  string `json:"role"`  // User's role (buyer, seller, admin)
}
