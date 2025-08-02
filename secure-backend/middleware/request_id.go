package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	// RequestIDHeader is the header key for request ID
	RequestIDHeader = "X-Request-ID"
	// RequestIDKey is the context key for request ID
	RequestIDKey = "RequestID"
)

// RequestID middleware adds a unique request ID to each request
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if request ID exists in header
		requestID := c.GetHeader(RequestIDHeader)
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// Add request ID to context and response headers
		c.Set(RequestIDKey, requestID)
		c.Header(RequestIDHeader, requestID)
		c.Next()
	}
}
