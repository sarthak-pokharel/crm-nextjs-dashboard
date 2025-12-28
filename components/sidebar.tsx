'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users, User, Briefcase, Activity, CheckSquare, LogOut } from 'lucide-react';
import { OrganizationSwitcher } from './organization-switcher';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Building2 },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Contacts', href: '/contacts', icon: User },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookie
    document.cookie = 'token=; path=/; max-age=0';
    
    // Redirect to login
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">CRM</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Customer Relationship</p>
        </div>

        {/* Organization Switcher */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <OrganizationSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
