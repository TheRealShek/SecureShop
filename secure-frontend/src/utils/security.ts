import type { User as SupabaseUser } from '@supabase/supabase-js';

// Define available roles in the system
export type UserRole = 'user' | 'seller' | 'admin';

// Define role hierarchy for access control
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'user': 1,
  'seller': 2,
  'admin': 3,
};

/**
 * Security utilities for role-based access control
 */
export class SecurityUtils {
  /**
   * Get user role from Supabase user object
   */
  static getUserRole(user: SupabaseUser | null): UserRole | null {
    if (!user?.user_metadata?.role) {
      return null;
    }
    
    const role = user.user_metadata.role as string;
    
    // Validate that the role is one of the allowed roles
    if (!['user', 'seller', 'admin'].includes(role)) {
      console.warn(`Invalid role detected: ${role} for user ${user.id}`);
      return null;
    }
    
    return role as UserRole;
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: SupabaseUser | null, requiredRole: UserRole): boolean {
    const userRole = this.getUserRole(user);
    
    if (!userRole) {
      return false;
    }
    
    return userRole === requiredRole;
  }

  /**
   * Check if user has at least the minimum required role level
   */
  static hasMinimumRole(user: SupabaseUser | null, minimumRole: UserRole): boolean {
    const userRole = this.getUserRole(user);
    
    if (!userRole) {
      return false;
    }
    
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
  }

  /**
   * Check if user can access a specific resource
   */
  static canAccess(user: SupabaseUser | null, requiredRoles: UserRole[]): boolean {
    const userRole = this.getUserRole(user);
    
    if (!userRole) {
      return false;
    }
    
    return requiredRoles.includes(userRole);
  }

  /**
   * Log security events for monitoring
   */
  static logSecurityEvent(event: 'unauthorized_access' | 'role_check_failed' | 'invalid_role', details: {
    userId?: string;
    userRole?: string | null;
    requiredRole?: UserRole;
    path?: string;
    timestamp?: Date;
  }) {
    const logEntry = {
      event,
      ...details,
      timestamp: details.timestamp || new Date(),
    };
    
    // In production, you might want to send this to a logging service
    console.warn('Security Event:', logEntry);
    
    // You could also send to an analytics service or security monitoring tool
    // Example: analytics.track('security_event', logEntry);
  }

  /**
   * Validate user session and permissions
   */
  static validateAccess(
    user: SupabaseUser | null,
    isAuthenticated: boolean,
    requiredRole?: UserRole,
    path?: string
  ): {
    allowed: boolean;
    reason?: string;
  } {
    // Check authentication first
    if (!isAuthenticated || !user) {
      this.logSecurityEvent('unauthorized_access', {
        userId: user?.id,
        path,
        requiredRole,
      });
      return {
        allowed: false,
        reason: 'User not authenticated',
      };
    }

    // If no specific role required, just authentication is enough
    if (!requiredRole) {
      return { allowed: true };
    }

    // Check role requirement
    const userRole = this.getUserRole(user);
    
    if (!userRole) {
      this.logSecurityEvent('invalid_role', {
        userId: user.id,
        userRole,
        requiredRole,
        path,
      });
      return {
        allowed: false,
        reason: 'User has no valid role assigned',
      };
    }

    const hasAccess = this.hasRole(user, requiredRole);
    
    if (!hasAccess) {
      this.logSecurityEvent('role_check_failed', {
        userId: user.id,
        userRole,
        requiredRole,
        path,
      });
      return {
        allowed: false,
        reason: `User role '${userRole}' insufficient for required role '${requiredRole}'`,
      };
    }

    return { allowed: true };
  }
}

/**
 * Hook-like utility for components
 */
export function useSecurityCheck(
  user: SupabaseUser | null,
  isAuthenticated: boolean,
  requiredRole?: UserRole
) {
  return SecurityUtils.validateAccess(user, isAuthenticated, requiredRole);
}
