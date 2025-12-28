'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, Shield, Settings } from 'lucide-react';

const managementItems = [
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Roles & Permissions', href: '/roles', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function ManagementNavbar() {
  const pathname = usePathname();

  const isManagementPage = pathname?.startsWith('/organizations') || 
                          pathname?.startsWith('/users') || 
                          pathname?.startsWith('/roles') ||
                          pathname?.startsWith('/settings');

  if (!isManagementPage) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-white mb-6">
      <nav className="flex gap-1 px-4">
        {managementItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
