# SecureShop Frontend

> This is the dedicated documentation for the **SecureShop Frontend** (React + TypeScript + Tailwind CSS). It is focused on developer onboarding, project structure, and key implementation details. For backend, deployment, or full-stack info, see the main project README.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Key Components](#key-components)
- [Authentication & Roles](#authentication--roles)
- [Routing & Navigation](#routing--navigation)
- [State Management](#state-management)
- [Utilities & Helpers](#utilities--helpers)
- [Styling & Theming](#styling--theming)
- [Running & Development](#running--development)
- [Logout & Session](#logout--session)

---

## Project Overview

---

## API Integration Details

### Key API Endpoints

- **Auth (Supabase):**
  - `POST /auth/v1/token` (login, handled by Supabase client)
  - `GET /auth/v1/user` (get current user/session)
- **Products (Supabase):**
  - `GET /products` (fetch all products)
  - `GET /products/:id` (fetch product by ID)
  - `POST /products` (create product)
  - `PUT /products/:id` (update product)
  - `DELETE /products/:id` (delete product)
- **Cart (Backend API):**
  - `GET /api/cart` (fetch cart items)
  - `POST /api/cart` (add item)
  - `PUT /api/cart/:itemId` (update quantity)
  - `DELETE /api/cart/:itemId` (remove item)
- **User (Backend API):**
  - `GET /api/user` (fetch profile)
  - `PUT /api/user` (update profile)

### API Response & Error Handling

- **Success:** Data is returned and mapped to TypeScript interfaces (see `ProductService`, `CartService`, `UserService`).
- **401 Unauthorized:**
  - Triggers forced logout, clears session/token, and redirects to `/login`.
- **500/Internal Errors:**
  - Errors are caught, logged, and surfaced to the user via the Toast system.
- **Validation:**
  - All product/user data is type-checked and validated before use.

---

## Component Communication Patterns

- **Props Drilling:** Used for simple parent-child data (e.g., `ProductCard` receives product info from `ProductGrid`).
- **React Context:**
  - `AuthContext` provides user, role, and session state globally.
  - `ToastProvider` exposes global notification methods.
- **Custom Hooks:**
  - Hooks like `useProducts`, `useAddToCart`, and `useProductData` encapsulate data fetching and mutation logic, returning state and handlers to components.
- **Lifting State:**
  - State is lifted to the nearest common ancestor when multiple children need to coordinate (e.g., cart state, selected product).

---

## Data Flow Explanation

1. **Authentication State:**
   - Managed by `AuthContext` (see `src/contexts/AuthContext.tsx`).
   - On login, user and JWT are stored in context and localStorage.
   - All components access auth state via the `useAuth` hook.
2. **Product Data:**
   - Fetched via `useProducts` (all products) or `useProductData` (single product).
   - Data is cached and shared using React Query.
3. **Cart State:**
   - Managed via API and React Query (`useAddToCart`, etc.).
   - Cart updates trigger cache invalidation and UI refresh.
4. **Role & Permissions:**
   - Role is fetched and cached in `AuthContext`, then used by `ProtectedRoute` and throughout the app for access control.

---

## Security Implementation Details

### Supabase Auth
- **Session Handling:**
  - On login, Supabase returns a JWT and user object.
  - JWT is stored in localStorage and context; session is auto-restored on reload.
  - Logout clears session, JWT, and all cached data.
- **JWT Storage:**
  - JWT is stored in `localStorage` for API requests and Supabase client.
  - All API requests include the JWT in the `Authorization` header.

### Role-Based Route Protection
- **ProtectedRoute Component:**
  - Checks if user is authenticated and has the required role(s).
  - If not, redirects to `/login` or shows an "Access Denied" message.
  - Admins always have access to all protected routes.
- **Client-Side Checks:**
  - Role is checked before rendering sensitive UI/actions (e.g., admin/seller pages, product management).
  - Role is periodically refreshed to detect changes.

### Additional Security
- **Type Guards:** All API data is validated before use.
- **XSS/CSRF:**
  - User input is sanitized where necessary.
  - Supabase and backend APIs are protected against CSRF by design (JWT-based auth).

---


---

## Folder Structure
```
secure-frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, SVGs
│   ├── components/      # UI components (ProductCard, ProductGrid, etc.)
│   ├── contexts/        # AuthContext (user, roles, session)
│   ├── docs/            # Frontend-specific docs
│   ├── hooks/           # Custom React hooks (data, cart, etc.)
│   ├── pages/           # Route-level pages (ProductsPage, LoginPage, etc.)
│   ├── services/        # API, Supabase client
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions (currency, security, type guards)
│   └── index.css        # Tailwind base styles
├── package.json         # Project metadata
├── tailwind.config.js   # Tailwind config
└── vite.config.ts       # Vite config
```

---

## Key Components
- **ProductCard:** Displays product info, handles missing images, INR formatting
- **ProductGrid:** Responsive grid (1/2/3/5 columns), max 25 products, modern layout
- **QuantitySelector:** Accessible, keyboard-friendly quantity control
- **Toast:** Global notification system (success, error, info)
- **ProtectedRoute:** Role-based route protection
- **RootRedirect:** Smart redirect based on auth/role

---

## Authentication & Roles
- **Supabase Auth:** Handles login, session, and role assignment
- **AuthContext:** Provides user, role, and session state globally
- **Role-Based Routing:** Only admins can access dashboard/manage pages; users see product/shop pages
- **Session Persistence:** Uses Supabase session; auto-redirects on login/logout

---

## Routing & Navigation
- **React Router:** All routes defined in `src/pages/`
- **ProtectedRoute:** Wraps sensitive pages (dashboard, manage)
- **RootRedirect:** Handles `/` and `/home` smart redirects
- **NotFoundPage:** 404 fallback

---

## State Management
- **React Context:** Auth/session/role state
- **React Query:** Product data fetching/caching
- **Custom Hooks:** Cart, product data, add-to-cart, etc.

---

## Utilities & Helpers
- **currency.ts:** Formats all prices as INR (₹)
- **typeGuards.ts:** TypeScript type guards for product/user
- **security.ts:** XSS/CSRF helpers

---

## Styling & Theming
- **Tailwind CSS:** Utility classes for all styling
- **Responsive Design:** Product grid adapts (1/2/3/5 columns)
- **Dark Mode:** (Optional, see Tailwind config)

---

## Running & Development
```sh
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint & format
npm run lint
```

---

## Logout & Session
- **Logout:** Use the logout button in the UI (calls Supabase signOut)
- **Session Expiry:** Auto-redirects to login on session loss

---

## Further Reading
- See `src/docs/` for deep dives on authentication, data fetching, routing, and security
- For backend/API, see the main project README

---

*This README is for frontend contributors. For full-stack/deployment info, always refer to the main project documentation.*
