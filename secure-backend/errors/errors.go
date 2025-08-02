package errors

import (
	"fmt"
	"net/http"
)

// AppError represents an application-specific error
type AppError struct {
	Code      int    `json:"code"`
	Message   string `json:"message"`
	Internal  error  `json:"-"` // Internal error details (not exposed)
	RequestID string `json:"request_id,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Internal != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Internal)
	}
	return e.Message
}

// NewError creates a new AppError
func NewError(code int, message string, internal error) *AppError {
	return &AppError{
		Code:     code,
		Message:  message,
		Internal: internal,
	}
}

// Common error types
var (
	ErrBadRequest = func(msg string, err error) *AppError {
		return NewError(http.StatusBadRequest, msg, err)
	}

	ErrUnauthorized = func(msg string, err error) *AppError {
		return NewError(http.StatusUnauthorized, msg, err)
	}

	ErrForbidden = func(msg string, err error) *AppError {
		return NewError(http.StatusForbidden, msg, err)
	}

	ErrNotFound = func(msg string, err error) *AppError {
		return NewError(http.StatusNotFound, msg, err)
	}

	ErrInternal = func(msg string, err error) *AppError {
		return NewError(http.StatusInternalServerError, msg, err)
	}

	ErrValidation = func(msg string, err error) *AppError {
		return NewError(http.StatusUnprocessableEntity, msg, err)
	}
)
