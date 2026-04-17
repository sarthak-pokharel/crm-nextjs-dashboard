'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { QueryProvider } from '@/lib/providers';
import { PermissionsProvider } from '@/lib/PermissionsProvider';
import { Sidebar } from '@/components/sidebar';
import { ManagementNavbar } from '@/components/management-navbar';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useOrganization } from '@/hooks/use-organization';

interface RootLayoutClientProps {
  children: ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const { currentOrgId, setCurrentOrgId, setOrganizations } = useOrganization();
  const hasFetchedOrgs = useRef(false);
  
  // Don't show sidebar on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isAuthPage && !hasFetchedOrgs.current) {
      hasFetchedOrgs.current = true;
      // Fetch user info and organizations on authenticated pages
      const fetchUserOrganizations = async () => {
        try {
          const user = await apiClient('/auth/me', { method: 'GET' });
          if (user?.organizations && Array.isArray(user.organizations)) {
            setOrganizations(user.organizations);
            // PermissionsProvider already handles setting the current org
            // from localStorage or defaulting to first org, so we don't
            // need to do it here
          }
        } catch (error) {
          console.error('Failed to fetch user organizations:', error);
        }
      };
      fetchUserOrganizations();
    }
  }, [isAuthPage]);

  return (
    <QueryProvider>
      <PermissionsProvider>
        {!isAuthPage && <Sidebar />}
        <main className={isAuthPage ? 'min-h-screen' : 'ml-64 min-h-screen bg-gray-50/50 dark:bg-gray-950 p-8'}>
          {!isAuthPage && <ManagementNavbar />}
          {children}
        </main>
      </PermissionsProvider>
    </QueryProvider>
  );
}
