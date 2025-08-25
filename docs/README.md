# SecureShop Documentation

Welcome to the SecureShop documentation! This folder contains all the documentation for the SecureShop e-commerce platform.

## Project Overview

SecureShop is a secure e-commerce platform built with React (frontend) and Go (backend), featuring role-based access control with three main user roles:

- **Buyer/User**: Browse products, manage cart, make purchases
- **Seller**: Manage products, view orders, access dashboard
- **Admin**: Platform oversight, user management, security monitoring

## Documentation Structure

### 📁 [Frontend Documentation](./frontend/)
Contains all frontend-related documentation including:
- Frontend setup and development guide
- Component documentation
- API integration docs
- Hooks documentation
- UI/UX improvements and features

### 📁 [Backend Documentation](./backend/)
Contains all backend-related documentation including:
- Backend API documentation
- Authentication and authorization
- Database integration
- Security features

### 📁 [Database Documentation](./database/)
Contains database-related documentation including:
- Database schema
- Row Level Security (RLS) setup
- Migration guides

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecureShop
   ```

2. **Setup Backend**
   - Follow instructions in [Backend Documentation](./backend/README.md)

3. **Setup Frontend**
   - Follow instructions in [Frontend Documentation](./frontend/README.md)

4. **Database Setup**
   - Follow [RLS Setup Guide](./database/rls-setup-guide.md)

## Architecture

```
SecureShop/
├── secure-frontend/     # React TypeScript frontend
├── secure-backend/      # Go backend API
├── docs/               # Documentation (this folder)
└── README.md           # Project overview
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Routing**: React Router
- **Build Tool**: Vite

### Backend
- **Language**: Go
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS)

### Database
- **Primary**: PostgreSQL (via Supabase)
- **Features**: Row Level Security, Real-time subscriptions
- **Authentication**: Supabase Auth

## Contributing

When adding new features or making changes:

1. Update relevant documentation in this `docs/` folder
2. Follow the existing documentation structure
3. Keep documentation in sync with code changes
4. Use clear, concise language and provide examples

## Support

For questions or issues:
- Check the relevant documentation section first
- Review the main project README
- Create an issue in the repository

---

*Last updated: August 25, 2025*
