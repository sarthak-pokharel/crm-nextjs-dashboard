'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { UserPermission } from '@/lib/permissions';
import { apiClient } from '@/lib/api-client';

interface PermissionsContextType {
  permissions: UserPermission[];
  organizationId?: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

/**
 * PermissionsProvider - Fetches and provides user permissions to the entire app
 * 
 * Must wrap the app to ensure permissions are available to all components.
 * Place it in your root layout after QueryProvider.
 */
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [organizationId, setOrganizationId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      console.log('PermissionsProvider: Fetching permissions...');
      console.log('Token:', localStorage.getItem('token') ? 'present' : 'missing');
      
      // Get current organization from localStorage or default
      const currentOrgId = localStorage.getItem('currentOrganizationId');
      const url = currentOrgId 
        ? `/auth/permissions?organizationId=${currentOrgId}`
        : '/auth/permissions';
      
      const response = await apiClient(url, {
        method: 'GET',
      });
      
      console.log('PermissionsProvider: Permissions fetched successfully:', response);
      setPermissions(response.permissions || []);
      
      // Set organizationId from response or localStorage
      const orgId = response.organizationId || (currentOrgId ? parseInt(currentOrgId) : undefined);
      setOrganizationId(orgId);
      
      // Store in localStorage if not already there
      if (orgId && !currentOrgId) {
        localStorage.setItem('currentOrganizationId', orgId.toString());
      }
      
      setError(null);
      setHasFetched(true);
    } catch (err) {
      console.log('PermissionsProvider: No permissions (likely not authenticated):', err instanceof Error ? err.message : err);
      // Expected error if not authenticated - don't set error state
      setPermissions([]);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch permissions ONCE on initial mount
  useEffect(() => {
    if (!hasFetched) {
      const timer = setTimeout(fetchPermissions, 100);
      return () => clearTimeout(timer);
    }
  }, [hasFetched]);

  // Listen to storage changes for multi-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('PermissionsProvider: Token changed in another tab, refetching...');
        setHasFetched(false); // Reset to trigger refetch
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, organizationId, isLoading, error, refetch: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

/**
 * Hook to access permissions context
 * 
 * Must be used inside PermissionsProvider
 */
export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used inside PermissionsProvider');
  }
  return context;
}
