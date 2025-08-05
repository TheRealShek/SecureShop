# SecureShop

A modern, security-first e-commerce platform built with React, Go, and Supabase. Perfect for learning full-stack development or rapid prototyping.

## Why SecureShop?

- **Security-first:** JWT authentication, RBAC, and Supabase Row Level Security
- **Modern stack:** React, Go, Supabase, Vite, Tailwind CSS
- **Production-ready:** Clean architecture with proper error handling and monitoring
- **Extensible:** Easy to customize and deploy

## Architecture

```
┌───────────────┐    JWT    ┌───────────────┐    JWT    ┌───────────────┐
│ React Frontend│ ────────▶ │  Go Backend   │ ────────▶ │   Supabase    │
└───────────────┘           └───────────────┘           └───────────────┘
      UI                API & Business Logic         Auth & Database
```

## Project Structure

```
SecureShop/
├── secure-backend/           # Go API server
│   ├── main.go
│   ├── handlers/             # API routes
│   ├── middleware/           # Auth, logging, security
│   ├── models/               # Data models
│   └── ...
│
├── secure-frontend/          # React app
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # App pages
│   │   ├── contexts/         # React contexts
│   │   └── services/         # API clients
│   └── ...
│
└── docs/                     # Detailed documentation
```

## Quick Start

### 1. Setup Supabase

1. Create a [Supabase](https://supabase.com) project
2. Enable Email/Password authentication
3. Run the SQL setup from `docs/supabase-setup.md`

### 2. Configure Environment

**Backend** (`secure-backend/.env`):
```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=8080
```

**Frontend** (`secure-frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Application

**Start Backend:**
```bash
cd secure-backend
go mod download
go run main.go
# Runs on http://localhost:8080
```

**Start Frontend:**
```bash
cd secure-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Demo Credentials

| Role   | Email                  | Password   | Access Level           |
|--------|------------------------|------------|------------------------|
| Admin  | admin@secureshop.com   | admin123   | Full system access     |
| Seller | seller@secureshop.com  | seller123  | Product management     |
| Buyer  | buyer@secureshop.com   | buyer123   | Shopping & orders      |

## Features

### Core Functionality
- **Authentication:** Secure login/register with Supabase Auth
- **Role-Based Access:** Admin, Seller, and Buyer roles with different permissions
- **Product Management:** CRUD operations with image upload
- **Shopping Cart:** Add to cart, checkout, order tracking
- **Analytics Dashboard:** Sales metrics and user management (Admin only)

### Security Features
- JWT token authentication
- Role-based access control (RBAC)
- Row Level Security (RLS) in database
- CORS protection and rate limiting
- Secure API endpoints with proper validation

### Technical Features
- Responsive design with Tailwind CSS
- Real-time updates with Supabase
- Prometheus metrics integration
- Load testing scripts (K6)
- Comprehensive error handling

## API Integration

The frontend communicates with the backend via REST API. Authentication uses JWT tokens:

```javascript
// API request with authentication
const response = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

Key endpoints:
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/products` - Get products (role-filtered)
- `GET /api/users` - User management (admin only)
- `GET /api/analytics` - Analytics data (admin only)

**Ready to build something awesome?** Clone this repo and start customizing!