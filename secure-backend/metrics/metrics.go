package metrics

import (
	"sync/atomic"
)

var (
	// TotalRequests counts total requests processed
	TotalRequests uint64

	// ErrorCount counts total errors encountered
	ErrorCount uint64
)

// IncrementRequests atomically increments the total request counter
func IncrementRequests() uint64 {
	return atomic.AddUint64(&TotalRequests, 1)
}

// IncrementErrors atomically increments the error counter
func IncrementErrors() uint64 {
	return atomic.AddUint64(&ErrorCount, 1)
}

// GetMetrics returns current metrics
func GetMetrics() map[string]uint64 {
	return map[string]uint64{
		"total_requests": atomic.LoadUint64(&TotalRequests),
		"error_count":    atomic.LoadUint64(&ErrorCount),
	}
}
