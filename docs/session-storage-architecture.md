# Session Storage Architecture Refactor

This document outlines the refactored session storage architecture for SecureShop, which creates a clear separation of concerns and improves security and user experience.

## Overview

The new architecture separates session management into three distinct layers:

1. **Supabase Auth Session** - Handled by Supabase SDK
2. **SessionStorage** - Temporary app cache (cleared on browser close)
3. **localStorage** - Persistent tokens (only when user explicitly chooses "Keep me signed in")

## Architecture Components

### 1. SessionManager (utils/sessionManager.ts)

Central utility class that manages all session-related operations with clear storage separation.

#### Key Features:
- **Supabase Session Management**: Let Supabase handle the actual authentication session
- **Session Cache**: Temporary data stored in sessionStorage (4-hour default expiration)
- **Persistent Tokens**: Optional localStorage storage with explicit user consent
- **Complete Cleanup**: Comprehensive logout that clears all storage types
- **Storage Separation**: Different storage types for different purposes

#### Main Methods:
```typescript
// Supabase session
await SessionManager.getSupabaseSession()
await SessionManager.validateSupabaseSession()

// Session storage (temporary cache)
SessionManager.setSessionCache(key, value, expiresIn?)
SessionManager.getSessionCache(key)
SessionManager.cacheUserRole(userId, role)
SessionManager.cacheUserData(user)

// Persistent storage (remember me)
SessionManager.setPersistentToken(token, { rememberMe: true })
SessionManager.getPersistentToken()

// Complete cleanup
await SessionManager.performCompleteLogout()
```

### 2. Updated AuthContext

The AuthContext now uses SessionManager throughout and supports the "Remember Me" functionality.

#### Key Changes:
- Uses SessionManager for all storage operations
- Supports persistent login with remember me option
- Clear separation between temporary and persistent data
- Enhanced session validation with smart caching

#### Updated Login Function:
```typescript
const login = async (email: string, password: string, rememberMe: boolean = false) => {
  // ... authentication logic ...
  
  // Store persistent token if remember me is enabled
  if (rememberMe) {
    SessionManager.setPersistentToken(token, { 
      rememberMe: true,
      duration: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
}
```

### 3. Enhanced Login Form

The login form now includes a "Keep me signed in" checkbox that controls persistent token storage.

#### New Feature:
- Remember me checkbox with clear explanation
- 30-day persistence when enabled
- No persistent storage when disabled

## Storage Strategy

### SessionStorage (Temporary Cache)
**Purpose**: App performance and user experience
**Duration**: Until browser close or 4 hours (whichever comes first)
**Contains**:
- User data cache
- Role cache
- Component state cache
- API response cache

**Cleared when**:
- Browser is closed
- User logs out
- Cache expires

### localStorage (Persistent Storage)
**Purpose**: "Remember me" functionality only
**Duration**: 30 days or until explicit logout
**Contains**:
- Authentication tokens (only when user opts in)

**Cleared when**:
- User logs out
- Token expires
- Manual cleanup

### Supabase Session
**Purpose**: Actual authentication state
**Managed by**: Supabase SDK
**Contains**:
- JWT tokens
- User identity
- Session metadata

## Security Improvements

### 1. Explicit Consent for Persistence
- Tokens are only stored persistently when user explicitly chooses "Keep me signed in"
- Clear UI indication of what this means (30-day storage)
- No surprise persistent data

### 2. Complete Cleanup on Logout
The logout process now cleans:
- Supabase session (via `supabase.auth.signOut()`)
- All sessionStorage data
- All localStorage data (including tokens)
- All cookies
- IndexedDB databases
- Any cached role data

### 3. Storage Separation
- Different storage types serve different purposes
- No interference between temporary and persistent data
- Clear data lifecycle management

## Usage Examples

### Basic Login (No Persistence)
```typescript
// User logs in normally
await login(email, password, false); // or omit rememberMe parameter

// User data cached in sessionStorage for performance
// No persistent storage used
// Session cleared when browser closes
```

### Persistent Login
```typescript
// User chooses "Keep me signed in"
await login(email, password, true);

// User data cached in sessionStorage for performance
// Token stored in localStorage for 30 days
// User stays logged in across browser sessions
```

### Session Restoration
```typescript
// On app startup, check for persistent token
const persistentToken = SessionManager.getPersistentToken();
if (persistentToken) {
  // Validate with Supabase and restore session
  const session = await SessionManager.getSupabaseSession();
  if (session) {
    // Restore user state from fresh API call
    // Cache in sessionStorage for performance
  }
}
```

### Complete Logout
```typescript
// Cleans everything regardless of how user logged in
await SessionManager.performCompleteLogout();

// Clears:
// - Supabase session
// - sessionStorage
// - localStorage
// - Cookies
// - IndexedDB
```

## Testing

### SessionManagerTester (utils/sessionManagerTester.ts)

Comprehensive test utility to verify all aspects of the session management.

#### Run Tests:
```javascript
// In browser console
SessionManagerTester.runAllTests();

// Or test individual components
await SessionManagerTester.testSupabaseSession();
SessionManagerTester.testSessionStorage();
SessionManagerTester.testPersistentStorage();
await SessionManagerTester.testLogoutCleanup();
```

#### Test Coverage:
- Supabase session management
- Session storage caching
- Persistent token storage
- Complete logout cleanup
- Storage separation
- Workflow demonstration

## Migration Benefits

### 1. Clear Separation of Concerns
- Supabase handles authentication
- SessionStorage handles temporary cache
- localStorage handles explicit persistence only

### 2. Improved Security
- No unexpected persistent data
- Complete cleanup on logout
- Clear user consent for persistence

### 3. Better User Experience
- Fast session restoration from cache
- Optional persistent login
- Clear indication of what data persists

### 4. Maintainability
- Single SessionManager for all session operations
- Clear API with consistent patterns
- Comprehensive test coverage

## Component Integration

### Reading Session Data
```typescript
// Components should read session data through AuthContext
const { user, role, token, isAuthenticated } = useAuth();

// NOT directly from storage
// const user = SessionManager.getCachedUserData(); // Don't do this
```

### Writing Session Data
```typescript
// All session writes should go through AuthContext or SessionManager
// Components should not directly manipulate localStorage/sessionStorage

// Correct way:
await login(email, password, rememberMe);
await logout();

// Incorrect way:
// localStorage.setItem('token', token); // Don't do this
```

## Debugging

### Check Current Storage State
```javascript
// In browser console
SessionManager.logStorageState();
```

### Demo the Workflow
```javascript
// In browser console
await SessionManagerTester.demoWorkflow();
```

This architecture provides a robust, secure, and user-friendly session management system that clearly separates temporary caching from persistent storage and ensures complete cleanup on logout.
