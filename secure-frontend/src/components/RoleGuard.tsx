import { useAuth } from '../contexts/AuthContext';
import { hasRequiredRole, type UserRole } from '../utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render UI based on user roles
 * 
 * @example
 * <RoleGuard allowedRoles={['admin', 'seller']}>
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * <RoleGuard requiredRole="seller" fallback={<p>Seller access only</p>}>
 *   <SellerDashboard />
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, requiredRole, fallback = null }: RoleGuardProps) {
  const { role, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated || !role) {
    return <>{fallback}</>;
  }

  let hasAccess = true;

  if (allowedRoles && allowedRoles.length > 0) {
    // Use allowedRoles array (preferred method)
    hasAccess = allowedRoles.includes(role) || role === 'admin'; // Admin always has access
  } else if (requiredRole) {
    // Use single requiredRole
    hasAccess = hasRequiredRole(role, requiredRole);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to check if current user has specific role permissions
 */
export function useRoleCheck() {
  const { role, isAuthenticated } = useAuth();

  const hasRole = (checkRole: UserRole): boolean => {
    return isAuthenticated && role === checkRole;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return isAuthenticated && role !== null && (roles.includes(role) || role === 'admin');
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return hasAnyRole(allowedRoles);
  };

  return {
    role,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    canAccess,
    isAdmin: hasRole('admin'),
    isSeller: hasRole('seller'),
    isBuyer: hasRole('buyer'),
  };
}
