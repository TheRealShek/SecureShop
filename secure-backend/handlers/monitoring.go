package handlers

import (
	"net/http"
	"runtime"
	"time"

	"secure-backend/database"
	"secure-backend/metrics"

	"github.com/gin-gonic/gin"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Services  map[string]string `json:"services"`
	System    SystemInfo        `json:"system"`
}

// SystemInfo represents system-level metrics
type SystemInfo struct {
	NumGoroutine int    `json:"num_goroutine"`
	NumCPU       int    `json:"num_cpu"`
	Version      string `json:"version"`
}

// HealthCheck handles the /healthz endpoint
func HealthCheck(c *gin.Context) {
	// Check database connection
	dbStatus := "up"
	if err := database.HealthCheck(); err != nil {
		dbStatus = "down"
	}

	// Build response
	response := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Services: map[string]string{
			"database": dbStatus,
		},
		System: SystemInfo{
			NumGoroutine: runtime.NumGoroutine(),
			NumCPU:       runtime.NumCPU(),
			Version:      runtime.Version(),
		},
	}

	c.JSON(http.StatusOK, response)
}

// BasicMetrics returns basic application metrics
func BasicMetrics(c *gin.Context) {
	currentMetrics := metrics.GetMetrics()
	c.JSON(http.StatusOK, gin.H{
		"timestamp":      time.Now(),
		"total_requests": currentMetrics["total_requests"],
		"error_count":    currentMetrics["error_count"],
		"goroutines":     runtime.NumGoroutine(),
	})
}
