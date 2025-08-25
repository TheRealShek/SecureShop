# Frontend Documentation

This section contains all documentation related to the SecureShop React frontend application.

## Overview

The frontend is a modern React application built with TypeScript, featuring:

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Build Tool**: Vite for fast development and building

## Quick Start

```bash
cd secure-frontend
npm install
npm run dev
```

The application will start on `http://localhost:5173`

## Project Structure

```
secure-frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Application pages/routes
│   ├── contexts/        # React contexts (Auth, Cart, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services and utilities
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── docs/               # Moved to /docs/frontend/
```

## Documentation Sections

### 📁 [Components Documentation](./components/README.md)
Detailed documentation for all React components including:
- Component API and props
- Usage examples
- Design patterns and best practices

### 📁 [Hooks Documentation](./hooks/README.md)
Custom React hooks for:
- Data fetching and state management
- Shopping cart functionality
- Authentication state
- Product management

### 📁 [API Documentation](./api/README.md)
Frontend API integration:
- Service layer architecture
- Authentication handling
- Error management
- API endpoint documentation

## Key Features

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: System preference detection
- **Accessibility**: WCAG 2.1 compliant components
- **Performance**: Optimized with React Query and lazy loading

### Authentication & Authorization
- **JWT Token Management**: Automatic token refresh
- **Role-Based Routing**: Different experiences for Admin/Seller/Buyer
- **Protected Routes**: Secure access to authenticated areas
- **Logout Functionality**: Secure session termination

### Shopping Experience
- **Product Browsing**: Grid/list views with filtering and sorting
- **Shopping Cart**: Persistent cart with real-time updates
- **Checkout Process**: Streamlined purchase flow
- **Order Tracking**: Status updates and history

### Admin & Seller Features
- **Dashboard**: Analytics and management overview
- **Product Management**: CRUD operations for inventory
- **Order Management**: Status updates and fulfillment
- **User Management**: Admin-only user oversight

## Environment Configuration

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Improvements and Features

### Recent Enhancements
- **[Grid Layout Improvements](./grid-layout-improvements.md)** - Enhanced product grid with better responsive behavior
- **[Product Details Improvements](./product-details-improvements.md)** - Enhanced product detail pages with better UX

### State Management
The application uses a hybrid approach:
- **React Query** for server state management
- **Context API** for authentication and cart state
- **Local State** for component-specific state

### Styling Architecture
- **Tailwind CSS** for utility-first styling
- **Component-based** styling with consistent design tokens
- **Responsive breakpoints** for all screen sizes
- **Custom animations** for enhanced user experience

## Testing

The frontend includes:
- Unit tests for components and hooks
- Integration tests for user flows
- E2E tests for critical paths

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

## Deployment

The frontend can be deployed to various platforms:

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Static Hosting
```bash
npm run build
# Serve dist/ folder with any static hosting service
```

## Contributing

When contributing to the frontend:

1. Follow the existing component patterns
2. Update documentation for new components/hooks
3. Ensure TypeScript types are properly defined
4. Test responsive behavior on all breakpoints
5. Maintain accessibility standards

---

*For more information, see the [main documentation](../README.md)*
