# SecureShop Backend (Go)

> This document provides a clear, beginner-friendly overview of the SecureShop backend, covering structure, API, authentication, middleware, database, environment, and running instructions.

---

## 1. Project Structure & Purpose

The backend is a Go (Golang) REST API that powers the SecureShop platform, handling authentication, product management, cart, and user roles. It integrates with Supabase for database and authentication.

**Folder Structure:**
```
secure-backend/
├── main.go            # Entry point
├── data/              # Static data (JSON for products/users)
├── database/          # DB config, product/user queries
├── errors/            # Custom error types
├── handlers/          # HTTP handlers (auth, cart, products, monitoring)
├── loadtest/          # K6 load testing scripts
├── metrics/           # Prometheus metrics
├── middleware/        # Auth, logging, rate limit, security
├── models/            # Go structs for products, users
├── utils/             # Utility functions (auth, etc.)
```

---

## 2. API Routes

| Method | Path                | Description                |
|--------|---------------------|----------------------------|
| POST   | /api/login          | User login                 |
| POST   | /api/register       | User registration          |
| GET    | /api/products       | List all products          |
| GET    | /api/products/:id   | Get product by ID          |
| POST   | /api/products       | Create product (admin/seller) |
| PUT    | /api/products/:id   | Update product (admin/seller) |
| DELETE | /api/products/:id   | Delete product (admin/seller) |
| GET    | /api/cart           | Get current user's cart    |
| POST   | /api/cart           | Add item to cart           |
| PUT    | /api/cart/:itemId   | Update cart item quantity  |
| DELETE | /api/cart/:itemId   | Remove item from cart      |
| GET    | /api/user           | Get user profile           |
| PUT    | /api/user           | Update user profile        |
| GET    | /api/monitor/health | Health check endpoint      |

### Example: Create Product
- **POST /api/products**
- **Request Body:**
```json
{
  "name": "Product Name",
  "description": "Details...",
  "price": 999,
  "image": "https://..."
}
```
- **Sample Response:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Details...",
  "price": 999,
  "image": "https://...",
  "sellerId": "uuid",
  "createdAt": "2025-08-07T12:00:00Z"
}
```
- **Error Handling:**
  - Returns `400` for invalid input, `401` for unauthorized, `500` for server/database errors. All errors are JSON with `error` field.

---

## 3. Auth & Session Handling
- **Authentication:** Uses Supabase JWT tokens. Login returns a JWT, which must be sent in the `Authorization: Bearer <token>` header for protected routes.
- **Session:** JWT is validated on each request. User roles (admin/seller/buyer) are checked via Supabase user metadata or DB lookup.
- **Role Validation:** Middleware checks required roles for sensitive endpoints (e.g., only admins/sellers can create products).

---

## 4. Middleware & Security
- **Auth Middleware:** Validates JWT, attaches user to request context.
- **Role Middleware:** Checks user role for protected routes.
- **Logging:** Logs all requests and errors.
- **Rate Limiting:** Prevents brute-force and abuse.
- **CORS:** Configured to allow frontend origin only.
- **Security:** All tokens are checked, and sensitive actions require correct role. Input is validated and sanitized.

---

## 5. Database Integration
- **Supabase:** Used for user, product, and cart tables. Connected via Go SDK or REST API.
- **Queries:** All CRUD operations use parameterized queries to prevent SQL injection.
- **Policies:** Supabase RLS (Row Level Security) and policies enforce access control at the DB level.

---

## 6. Environment Configuration
| Variable           | Description                        |
|--------------------|------------------------------------|
| SUPABASE_URL       | Supabase project URL                |
| SUPABASE_KEY       | Supabase service role key           |
| PORT               | Port to run the server (default 8080)|
| FRONTEND_ORIGIN    | Allowed CORS origin (frontend URL)  |
| RATE_LIMIT         | Requests per minute per IP          |

---

## 7. Running the Server
```sh
# Install dependencies
cd secure-backend
 go mod tidy

# Run the server
 go run main.go

# Or build and run
 go build -o backend main.go
 ./backend
```
- The server will start on `http://localhost:8080` by default.
- Use `.env` or environment variables to configure secrets and ports.

---

*For more details, see code comments in each folder. This backend is designed for clarity, security, and easy onboarding.*
