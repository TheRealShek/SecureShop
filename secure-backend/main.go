package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"secure-backend/database"
	"secure-backend/handlers"
	"secure-backend/middleware"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Validate required environment variables
	if os.Getenv("SUPABASE_JWT_SECRET") == "" {
		log.Fatal("SUPABASE_JWT_SECRET environment variable is required")
	}
	if os.Getenv("DATABASE_URL") == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Initialize database connection
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router without default middleware
	r := gin.New()

	// Recovery middleware (must be first to handle panics)
	r.Use(gin.Recovery())

	// Request ID middleware (for tracing)
	r.Use(middleware.RequestID())

	// Request logging middleware with metrics
	r.Use(middleware.RequestLogger())

	// Error handling middleware
	r.Use(middleware.ErrorHandler())

	// Security headers
	r.Use(middleware.SecurityHeaders())

	// Request size limits (10MB)
	r.Use(middleware.RequestSizeMiddleware(10 << 20))

	// CORS middleware with environment-based configuration
	config := cors.DefaultConfig()
	if os.Getenv("GIN_MODE") == "release" {
		// Production CORS settings
		config.AllowOrigins = strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	} else {
		// Development CORS settings
		config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173"}
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		// Public endpoints (no auth required)
		api.GET("/healthz", handlers.HealthCheck)  // Health check endpoint
		api.GET("/metrics", handlers.BasicMetrics) // Basic metrics endpoint

		// Rate limit public endpoints by IP
		api.Use(middleware.RateLimitByIP())

		// Protected routes (require Supabase Auth)
		protected := api.Group("")
		protected.Use(middleware.SupabaseAuthMiddleware())
		protected.Use(middleware.RateLimitByIP()) // Rate limiting for authenticated users
		{
			// Product routes
			products := protected.Group("/products")
			{
				products.GET("", handlers.GetProducts)          // List products (filtered by role)
				products.POST("", handlers.CreateProduct)       // Create product (sellers only)
				products.GET("/:id", handlers.GetProduct)       // Get single product
				products.PUT("/:id", handlers.UpdateProduct)    // Update product (seller's own only)
				products.DELETE("/:id", handlers.DeleteProduct) // Delete product (seller's own only)
			}

			// Cart routes
			cart := protected.Group("/cart")
			{
				cart.GET("", handlers.GetCart)               // Get user's cart
				cart.POST("", handlers.AddToCart)            // Add item to cart
				cart.PUT("/:id", handlers.UpdateCartItem)    // Update cart item quantity
				cart.DELETE("/:id", handlers.RemoveCartItem) // Remove cart item
				cart.DELETE("", handlers.ClearCart)          // Clear entire cart
				cart.GET("/count", handlers.GetCartCount)    // Get cart item count
			}

			// User routes
			protected.GET("/user", handlers.GetUserInfo) // Get authenticated user info
		}
	}

	// Configure server with timeouts
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Graceful shutdown
	log.Println("Server is shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
