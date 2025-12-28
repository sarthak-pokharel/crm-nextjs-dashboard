'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/lib/providers';
import { PermissionsProvider } from '@/lib/PermissionsProvider';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';

interface RootLayoutClientProps {
  children: ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <QueryProvider>
      <PermissionsProvider>
        {!isAuthPage && <Sidebar />}
        <main className={isAuthPage ? 'min-h-screen' : 'ml-64 min-h-screen p-8'}>
          {children}
        </main>
      </PermissionsProvider>
    </QueryProvider>
  );
}
