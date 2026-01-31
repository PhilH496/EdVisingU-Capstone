/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Role requirement check
    if (requireRole && profile?.role !== requireRole) {
      // Redirect based on role
      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/application-status');
      }
    }
  }, [user, profile, loading, requireRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!user || (requireRole && profile?.role !== requireRole)) {
    return null;
  }

  return <>{children}</>;
}
