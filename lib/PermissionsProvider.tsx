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

  /**
   * Step 1: Fetch user's organizations
   * Step 2: Use stored org preference or first organization
   * Step 3: Fetch permissions for that organization
   */
  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      console.log('PermissionsProvider: Step 1 - Fetching user organizations...');
      
      // Step 1: Get user's organizations
      const userResponse = await apiClient('/auth/me', {
        method: 'GET',
      });
      
      console.log('PermissionsProvider: User organizations:', userResponse.organizations);
      
      if (!userResponse.organizations || userResponse.organizations.length === 0) {
        console.log('PermissionsProvider: User has no organizations');
        setPermissions([]);
        setOrganizationId(undefined);
        setError(null);
        setHasFetched(true);
        return;
      }

      // Step 2: Determine which organization to use
      let currentOrgId = parseInt(localStorage.getItem('currentOrgId') || '0');
      
      // Validate that stored org is in user's organizations
      const orgExists = userResponse.organizations.some((org: any) => org.id === currentOrgId);
      
      if (!orgExists || currentOrgId === 0) {
        // Use first organization
        currentOrgId = userResponse.organizations[0].id;
        console.log('PermissionsProvider: Using default organization:', currentOrgId);
      } else {
        console.log('PermissionsProvider: Using stored organization:', currentOrgId);
      }

      // Step 3: Fetch permissions for the selected organization
      console.log('PermissionsProvider: Step 2 - Fetching permissions for org:', currentOrgId);
      const permissionsResponse = await apiClient(`/auth/permissions?organizationId=${currentOrgId}`, {
        method: 'GET',
      });
      
      console.log('PermissionsProvider: Permissions fetched for org:', currentOrgId, permissionsResponse.permissions);
      setPermissions(permissionsResponse.permissions || []);
      setOrganizationId(currentOrgId);
      
      // Store current organization preference
      localStorage.setItem('currentOrgId', currentOrgId.toString());
      
      setError(null);
      setHasFetched(true);
    } catch (err) {
      console.log('PermissionsProvider: Error fetching permissions:', err instanceof Error ? err.message : err);
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
