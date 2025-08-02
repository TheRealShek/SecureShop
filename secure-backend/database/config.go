package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// DB is the global database connection
var DB *sqlx.DB

// Config holds database connection configuration
type Config struct {
	MaxOpenConns int
	MaxIdleConns int
	MaxLifetime  time.Duration
}

// DefaultConfig provides sensible defaults
var defaultConfig = Config{
	MaxOpenConns: 25,
	MaxIdleConns: 5,
	MaxLifetime:  5 * time.Minute,
}

// InitDB initializes the database connection with retries
func InitDB() error {
	return initDBWithConfig(&defaultConfig)
}

// InitDBWithConfig initializes the database connection with custom configuration
func initDBWithConfig(cfg *Config) error {
	if cfg == nil {
		cfg = &defaultConfig
	}

	var err error
	maxRetries := 5
	retryDelay := time.Second

	for i := 0; i < maxRetries; i++ {
		DB, err = connectDB(cfg)
		if err == nil {
			log.Printf("Successfully connected to database (attempt %d/%d)", i+1, maxRetries)
			return nil
		}

		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			time.Sleep(retryDelay)
			retryDelay *= 2 // Exponential backoff
		}
	}

	return fmt.Errorf("failed to connect to database after %d attempts: %v", maxRetries, err)
}

// connectDB establishes the database connection with the given configuration
func connectDB(cfg *Config) (*sqlx.DB, error) {
	// Get connection string
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	// Log connection attempt (without credentials)
	sanitizedURL := sanitizeConnString(connStr)
	log.Printf("Attempting to connect to database: %s", sanitizedURL)

	// Open connection
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("opening database connection: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.MaxLifetime)

	// Verify connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close() // Close the connection if ping fails
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	log.Printf("Successfully established database connection to %s", sanitizedURL)
	return db, nil
}

// sanitizeConnString removes sensitive information from connection string for logging
func sanitizeConnString(connStr string) string {
	// Basic sanitation - you might want to improve this
	if connStr == "" {
		return ""
	}
	// Hide password
	sanitized := connStr
	if i := strings.Index(sanitized, ":"); i > 0 {
		if j := strings.Index(sanitized[i+1:], "@"); j > 0 {
			sanitized = sanitized[:i+1] + "*****" + sanitized[i+1+j:]
		}
	}
	return sanitized
}

// HealthCheck performs a health check on the database
func HealthCheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return DB.PingContext(ctx)
}
