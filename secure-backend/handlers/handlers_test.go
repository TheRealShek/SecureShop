package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"secure-backend/handlers"
	"secure-backend/middleware"
	"secure-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(middleware.RequestID())
	r.Use(gin.Recovery())
	r.Use(middleware.SecurityHeaders())

	return r
}

func TestGetProducts(t *testing.T) {
	r := setupTestRouter()
	r.GET("/products", handlers.GetProducts)

	// Test cases
	tests := []struct {
		name          string
		role          string
		expectedCode  int
		expectedItems int
	}{
		{
			name:          "Buyer sees published products",
			role:          "buyer",
			expectedCode:  http.StatusOK,
			expectedItems: 2,
		},
		{
			name:          "Seller sees own products",
			role:          "seller",
			expectedCode:  http.StatusOK,
			expectedItems: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/products", nil)

			// Mock auth user
			ctx := mockAuthUser(req, tt.role)

			r.ServeHTTP(w, req.WithContext(ctx))

			assert.Equal(t, tt.expectedCode, w.Code)

			if tt.expectedCode == http.StatusOK {
				var response []models.Product
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Len(t, response, tt.expectedItems)
			}
		})
	}
}

// Helper function to mock authenticated user
func mockAuthUser(req *http.Request, role string) context.Context {
	ctx := req.Context()
	user := &models.User{
		ID:    "test-user",
		Role:  role,
		Email: "test@example.com",
	}
	return context.WithValue(ctx, middleware.UserKey, user)
}
