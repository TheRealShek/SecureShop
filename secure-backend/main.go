package main

import (
	"secure-backend/handlers"
	"secure-backend/middleware"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.Default())

	// API routes
	api := r.Group("/api")
	{
		// Public routes
		api.POST("/login", handlers.Login)
		api.POST("/signup", handlers.Signup)
		api.GET("/products", handlers.GetProducts)

		// Protected routes
		auth := api.Group("/")
		auth.Use(middleware.JWTAuthMiddleware())
		auth.GET("/cart", handlers.GetCart)
		auth.POST("/logout", handlers.Logout)
	}

	r.Run(":8080")
} 