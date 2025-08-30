package utils

import (
	"html"
	"regexp"
	"strings"
	"unicode"
)

// SanitizationOptions defines options for input sanitization
type SanitizationOptions struct {
	TrimWhitespace bool
	EscapeHTML     bool
	RemoveNewlines bool
	MaxLength      int
	AllowedChars   *regexp.Regexp
	PreserveSpaces bool
}

// DefaultTextOptions provides safe defaults for text input sanitization
var DefaultTextOptions = SanitizationOptions{
	TrimWhitespace: true,
	EscapeHTML:     true,
	RemoveNewlines: false,
	MaxLength:      1000,
	PreserveSpaces: true,
}

// DefaultDescriptionOptions provides safe defaults for longer text descriptions
var DefaultDescriptionOptions = SanitizationOptions{
	TrimWhitespace: true,
	EscapeHTML:     true,
	RemoveNewlines: false,
	MaxLength:      5000,
	PreserveSpaces: true,
}

// DefaultEmailOptions provides safe defaults for email sanitization
var DefaultEmailOptions = SanitizationOptions{
	TrimWhitespace: true,
	EscapeHTML:     true,
	RemoveNewlines: true,
	MaxLength:      254, // RFC 5321 email length limit
	PreserveSpaces: false,
}

// SanitizeInput sanitizes user input according to the provided options
func SanitizeInput(input string, options SanitizationOptions) string {
	result := input

	// Trim whitespace if requested
	if options.TrimWhitespace {
		result = strings.TrimSpace(result)
	}

	// Remove or normalize newlines
	if options.RemoveNewlines {
		result = strings.ReplaceAll(result, "\n", " ")
		result = strings.ReplaceAll(result, "\r", " ")
		result = strings.ReplaceAll(result, "\t", " ")
	}

	// Normalize multiple spaces to single space if not preserving spaces
	if !options.PreserveSpaces {
		spaceRegex := regexp.MustCompile(`\s+`)
		result = spaceRegex.ReplaceAllString(result, " ")
	}

	// Apply allowed characters filter if specified
	if options.AllowedChars != nil {
		var filtered strings.Builder
		for _, char := range result {
			if options.AllowedChars.MatchString(string(char)) {
				filtered.WriteRune(char)
			}
		}
		result = filtered.String()
	}

	// Escape HTML entities to prevent XSS
	if options.EscapeHTML {
		result = html.EscapeString(result)
	}

	// Truncate to maximum length if specified
	if options.MaxLength > 0 && len(result) > options.MaxLength {
		result = result[:options.MaxLength]
	}

	return result
}

// SanitizeProductName sanitizes product names
func SanitizeProductName(name string) string {
	return SanitizeInput(name, SanitizationOptions{
		TrimWhitespace: true,
		EscapeHTML:     true,
		RemoveNewlines: true,
		MaxLength:      100,
		PreserveSpaces: true,
	})
}

// SanitizeProductDescription sanitizes product descriptions
func SanitizeProductDescription(description string) string {
	return SanitizeInput(description, DefaultDescriptionOptions)
}

// SanitizeEmail sanitizes email addresses
func SanitizeEmail(email string) string {
	sanitized := SanitizeInput(email, DefaultEmailOptions)
	return strings.ToLower(sanitized)
}

// SanitizeAddress sanitizes shipping addresses
func SanitizeAddress(address string) string {
	return SanitizeInput(address, SanitizationOptions{
		TrimWhitespace: true,
		EscapeHTML:     true,
		RemoveNewlines: false, // Allow newlines in addresses
		MaxLength:      500,
		PreserveSpaces: true,
	})
}

// SanitizeSearchQuery sanitizes search queries
func SanitizeSearchQuery(query string) string {
	return SanitizeInput(query, SanitizationOptions{
		TrimWhitespace: true,
		EscapeHTML:     true,
		RemoveNewlines: true,
		MaxLength:      200,
		PreserveSpaces: true,
	})
}

// IsValidProductStatus validates product status values
func IsValidProductStatus(status string) bool {
	validStatuses := map[string]bool{
		"draft":     true,
		"published": true,
		"archived":  true,
	}
	return validStatuses[strings.ToLower(strings.TrimSpace(status))]
}

// IsValidUserRole validates user role values
func IsValidUserRole(role string) bool {
	validRoles := map[string]bool{
		"buyer":  true,
		"seller": true,
		"admin":  true,
	}
	return validRoles[strings.ToLower(strings.TrimSpace(role))]
}

// RemoveControlCharacters removes control characters from input
func RemoveControlCharacters(input string) string {
	var result strings.Builder
	for _, char := range input {
		if !unicode.IsControl(char) || char == '\n' || char == '\r' || char == '\t' {
			result.WriteRune(char)
		}
	}
	return result.String()
}

// SanitizeJSONInput sanitizes input that will be used in JSON responses
func SanitizeJSONInput(input string) string {
	// Remove control characters except newlines
	sanitized := RemoveControlCharacters(input)

	// Escape HTML but preserve JSON structure
	sanitized = html.EscapeString(sanitized)

	return strings.TrimSpace(sanitized)
}
