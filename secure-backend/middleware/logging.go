package middleware

import (
	"log"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	// Global request metrics using atomic operations for thread safety
	totalRequests uint64
	totalErrors   uint64
)

// RequestLogger middleware logs HTTP requests with timing information
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Calculate metrics
		latency := time.Since(start)
		status := c.Writer.Status()

		// Update global metrics
		atomic.AddUint64(&totalRequests, 1)
		if status >= 400 {
			atomic.AddUint64(&totalErrors, 1)
		}

		// Log format: timestamp | method path | status | latency | total_reqs | errors
		log.Printf("%s | %s %s | %d | %v | total=%d errors=%d",
			time.Now().Format("2006/01/02 15:04:05"),
			c.Request.Method,
			c.Request.URL.Path,
			status,
			latency,
			atomic.LoadUint64(&totalRequests),
			atomic.LoadUint64(&totalErrors))

		// Store request metrics in context
		c.Set("RequestMetrics", map[string]interface{}{
			"latency":     latency,
			"status":      status,
			"totalReqs":   atomic.LoadUint64(&totalRequests),
			"totalErrors": atomic.LoadUint64(&totalErrors),
		})
	}
}

// ErrorHandler middleware provides consistent error response format
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Only handle errors if there are any
		if len(c.Errors) > 0 {
			err := c.Errors.Last()

			// Get error details
			statusCode := c.Writer.Status()
			if statusCode == 200 {
				// If no status is set but there's an error, use 500
				statusCode = 500
			}

			// Structure the error response
			errorResponse := gin.H{
				"error": err.Error(),
			}

			// Add error details for non-production environments
			if gin.Mode() != gin.ReleaseMode {
				errorResponse["details"] = err.Meta
			}

			c.JSON(statusCode, errorResponse)
		}
	}
}
