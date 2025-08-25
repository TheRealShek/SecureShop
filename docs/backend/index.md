# Backend Documentation

This section contains all documentation related to the SecureShop Go backend API.

## Overview

The backend is a RESTful API server built with Go, featuring:

- **Language**: Go 1.21+
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT tokens with Supabase Auth
- **Security**: Row Level Security (RLS), CORS, rate limiting
- **Monitoring**: Prometheus metrics integration
- **Testing**: Load testing with K6

## Quick Start

```bash
cd secure-backend
go mod download
go run main.go
```

The API server will start on `http://localhost:8080`

## Project Structure

```
secure-backend/
├── main.go              # Application entry point
├── handlers/            # HTTP route handlers
│   ├── auth.go         # Authentication endpoints
│   ├── products.go     # Product CRUD operations
│   ├── cart.go         # Shopping cart endpoints
│   └── monitoring.go   # Health and metrics
├── middleware/          # HTTP middleware
│   ├── auth.go         # JWT authentication
│   ├── logging.go      # Request logging
│   ├── security.go     # Security headers
│   └── ratelimit.go    # Rate limiting
├── models/             # Data models and types
├── database/           # Database utilities and config
├── utils/              # Helper functions
├── errors/             # Error handling
├── metrics/            # Prometheus metrics
└── loadtest/           # K6 load testing scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify JWT token and get user info
- `POST /api/auth/refresh` - Refresh authentication token

### Products
- `GET /api/products` - List all products (with role-based filtering)
- `GET /api/products/:id` - Get specific product details
- `POST /api/products` - Create new product (Seller/Admin only)
- `PUT /api/products/:id` - Update product (Seller/Admin only)
- `DELETE /api/products/:id` - Delete product (Seller/Admin only)

### Shopping Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### User Management (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/role` - Update user role

### Analytics (Admin only)
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/users` - User analytics

### Monitoring
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics

## Security Features

### Authentication & Authorization
- **JWT Token Validation**: All protected endpoints require valid JWT
- **Role-Based Access Control**: Different permissions for Admin/Seller/Buyer
- **Supabase Integration**: Leverages Supabase Auth for user management

### Database Security
- **Row Level Security (RLS)**: Database-level access control
- **Prepared Statements**: SQL injection prevention
- **Connection Pooling**: Secure and efficient database connections

### API Security
- **CORS Protection**: Configurable cross-origin policies
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Security Headers**: HSTS, CSP, and other security headers
- **Input Validation**: Comprehensive request validation

## Environment Configuration

Create a `.env` file in the backend root:

```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server
PORT=8080
ENVIRONMENT=development

# Security
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## Database Integration

### Supabase Configuration
The backend integrates with Supabase for:
- **Authentication**: User management and JWT validation
- **Database**: PostgreSQL with real-time capabilities
- **Storage**: File uploads for product images
- **Row Level Security**: Database-level access control

### Connection Management
```go
// Database connection with connection pooling
config := database.Config{
    URL: os.Getenv("SUPABASE_URL"),
    Key: os.Getenv("SUPABASE_KEY"),
    MaxConnections: 20,
    MaxIdleTime: 5 * time.Minute,
}
```

## Error Handling

The backend implements comprehensive error handling:

### Error Types
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Invalid or expired tokens
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: Connection or query failures
- **Business Logic Errors**: Application-specific errors

### Error Response Format
```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error context"
  },
  "timestamp": "2025-08-25T10:30:00Z"
}
```

## Monitoring & Metrics

### Prometheus Integration
The backend exposes metrics for monitoring:

```
# HTTP request metrics
http_requests_total
http_request_duration_seconds

# Database metrics
database_connections_active
database_query_duration_seconds

# Business metrics
products_created_total
orders_processed_total
```

### Health Checks
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-25T10:30:00Z",
  "checks": {
    "database": "connected",
    "supabase": "connected"
  }
}
```

## Load Testing

K6 scripts are provided for performance testing:

```bash
cd loadtest
k6 run --vus 10 --duration 30s k6-script.js
```

### Test Scenarios
- **Product Listing**: High-volume product browsing
- **Authentication**: Login/logout flows
- **Shopping Cart**: Add/remove operations
- **Checkout Process**: Order creation and processing

## Development

### Running in Development
```bash
go run main.go
```

### Building for Production
```bash
go build -o secure-backend main.go
```

### Running Tests
```bash
go test ./...
go test -race ./...          # Race condition detection
go test -cover ./...         # Coverage report
```

### Code Quality
```bash
go fmt ./...                 # Format code
go vet ./...                 # Static analysis
golangci-lint run           # Comprehensive linting
```

## Deployment

### Docker Deployment
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- JWT secrets
- CORS origins
- Rate limiting configuration

## Contributing

When contributing to the backend:

1. Follow Go best practices and conventions
2. Add tests for new functionality
3. Update API documentation
4. Ensure security considerations are addressed
5. Add appropriate logging and metrics

### Code Style
- Use `gofmt` for consistent formatting
- Follow effective Go guidelines
- Add comprehensive error handling
- Include appropriate logging

---

*For more information, see the [main documentation](../README.md)*
