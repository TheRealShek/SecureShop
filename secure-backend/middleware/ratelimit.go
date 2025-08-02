package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter stores rate limiters for different IPs
type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

// NewIPRateLimiter creates a new rate limiter
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}

	// Start cleanup routine
	go i.cleanupLoop()
	return i
}

// GetLimiter returns the rate limiter for the provided IP
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter, exists := i.ips[ip]
	if !exists {
		limiter = rate.NewLimiter(i.r, i.b)
		i.ips[ip] = limiter
	}

	return limiter
}

// cleanupLoop periodically cleans up the rate limiters map to prevent memory leaks
func (i *IPRateLimiter) cleanupLoop() {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		i.mu.Lock()
		// Reset the map every hour to prevent memory leaks
		i.ips = make(map[string]*rate.Limiter)
		i.mu.Unlock()
	}
}

// RateLimitByIP creates a gin middleware for IP-based rate limiting
func RateLimitByIP() gin.HandlerFunc {
	limiter := NewIPRateLimiter(1, 100) // 100 requests per second per IP

	return func(c *gin.Context) {
		limiter := limiter.GetLimiter(c.ClientIP())
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests",
			})
			return
		}
		c.Next()
	}
}
