package handlers

import (
	"net/http"
	"secure-backend/models"
	"github.com/gin-gonic/gin"
)

var mockProducts = []models.Product{
	{ID: 1, Name: "Laptop", Description: "A fast laptop", Price: 999.99},
	{ID: 2, Name: "Phone", Description: "A smart phone", Price: 499.99},
	{ID: 3, Name: "Headphones", Description: "Noise-cancelling headphones", Price: 199.99},
}

func GetProducts(c *gin.Context) {
	c.JSON(http.StatusOK, mockProducts)
}