# SecureShop 🛒

[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, security-first e-commerce platform built with React, Go, and Supabase. Perfect for learning full-stack development or rapid prototyping.

## ✨ Features at a Glance

🔐 **Secure Authentication** - JWT-based auth with Supabase  
👥 **Role-Based Access** - Admin, Seller, Buyer permissions  
🛍️ **Complete E-commerce** - Products, cart, orders, checkout  
📊 **Analytics Dashboard** - Sales metrics and insights  
🚀 **Production Ready** - Clean architecture, error handling  
📱 **Responsive Design** - Mobile-first with Tailwind CSS

## 📋 Table of Contents

- [Why SecureShop?](#why-secureshop)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#-quick-start)
- [Demo Credentials](#-demo-credentials)
- [Features](#-features)
- [API Integration](#api-integration)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support--contact)

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
└── docs/                     # 📚 Complete documentation
    ├── README.md             # Documentation overview
    ├── frontend/             # Frontend docs & guides
    ├── backend/              # Backend API documentation
    └── database/             # Database setup & RLS guides
```

## 🚀 Quick Start

> **💡 Pro Tip:** For detailed setup instructions, see the [Complete Documentation](./docs/README.md).

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [Go](https://golang.org/) 1.21+
- [Git](https://git-scm.com/)
- [Supabase Account](https://supabase.com/) (free tier available)

### 1. Setup Supabase

1. Create a [Supabase](https://supabase.com) project
2. Enable Email/Password authentication
3. Run the SQL setup from `docs/database/rls-setup-guide.md`

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
# 🚀 Server running on http://localhost:8080
```

**Start Frontend:**
```bash
cd secure-frontend
npm install
npm run dev
# 🎨 App running on http://localhost:5173
```

## 🎭 Demo Credentials

Try the platform with these pre-configured accounts:

| Role   | Email                  | Password   | What You Can Do        |
|--------|------------------------|------------|------------------------|
| 👑 Admin  | admin@secureshop.com   | admin123   | Full system access, analytics |
| 🏪 Seller | seller@secureshop.com  | seller123  | Manage products, view orders |
| 🛒 Buyer  | buyer@secureshop.com   | buyer123   | Shop, cart, checkout   |

## 🎯 Features

### 🛍️ Core E-commerce
- **Product Catalog** - Browse, search, and filter products
- **Shopping Cart** - Add items, update quantities, persistent cart
- **Secure Checkout** - Order processing with inventory management
- **Order Tracking** - View order history and status updates

### 🔐 Security & Authentication
- **JWT Authentication** - Secure token-based login system
- **Role-Based Access Control** - Fine-grained permissions system
- **Row Level Security** - Database-level data protection
- **API Security** - CORS protection, rate limiting, input validation

### 📊 Business Features
- **Seller Dashboard** - Product management and sales analytics
- **Admin Panel** - User management and system oversight
- **Real-time Updates** - Live inventory and order updates
- **Analytics** - Sales metrics and performance insights

### 🛠️ Technical Features
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Type Safety** - Full TypeScript integration
- **Performance** - Optimized builds with Vite
- **Monitoring** - Prometheus metrics and health checks
- **Testing** - Load testing with K6 scripts

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

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[📖 Complete Documentation](./docs/README.md)** - Overview and getting started
- **[🎨 Frontend Documentation](./docs/frontend/README.md)** - React app, components, hooks
- **[⚙️ Backend Documentation](./docs/backend/README.md)** - Go API, authentication, security
- **[🗄️ Database Documentation](./docs/database/)** - PostgreSQL setup, RLS configuration

**Ready to build something awesome?** Clone this repo and start customizing!

## 📸 Screenshots

### 🏠 Homepage
Clean, modern interface with featured products and intuitive navigation.

### 🛒 Shopping Experience  
Seamless cart management with real-time updates and smooth checkout flow.

### 📊 Seller Dashboard
Comprehensive analytics and product management tools for sellers.

*Screenshots coming soon! This project is actively being developed.*

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | User interface and interactions |
| **Styling** | Tailwind CSS | Responsive, utility-first styling |
| **Backend** | Go + Gin | RESTful API server |
| **Database** | PostgreSQL (Supabase) | Data storage with RLS |
| **Auth** | Supabase Auth | JWT-based authentication |
| **Build** | Vite | Fast development and building |
| **Icons** | Heroicons | Consistent iconography |

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌟 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💾 Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **🚀 Push to the branch** (`git push origin feature/amazing-feature`)
5. **📫 Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Ensure code passes all security checks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

- 📚 **Documentation**: [Complete Docs](./docs/README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/TheRealShek/SecureShop/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/TheRealShek/SecureShop/discussions)
- 📧 **Email**: [Your contact email]

## ⭐ Star History

If this project helped you, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=TheRealShek/SecureShop&type=Date)](https://star-history.com/#TheRealShek/SecureShop&Date)

---

<div align="center">

**Built with ❤️ for the developer community**

[⬆ Back to top](#secureshop-)

</div>