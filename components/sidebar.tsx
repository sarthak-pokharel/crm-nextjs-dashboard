'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Building2, Users, UserCircle, Handshake,
    Activity, ListTodo, LogOut, Settings, Zap
} from 'lucide-react';
import { OrganizationSwitcher } from './organization-switcher';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Contacts', href: '/contacts', icon: UserCircle },
    { name: 'Deals', href: '/deals', icon: Handshake },
    { name: 'Activities', href: '/activities', icon: Activity },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
];

const managementItems = [
    { name: 'Management', href: '/organizations', icon: Settings },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 z-30">
            <div className="flex flex-col h-full">
                {/* Brand */}
                <div className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                            <Zap size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">CRM Suite</h1>
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Enterprise</p>
                        </div>
                    </div>
                </div>

                {/* Organization Switcher */}
                <div className="border-y border-gray-100 dark:border-gray-800/60 mx-4 px-0 py-3">
                    <OrganizationSwitcher />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Menu</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                    active
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'} />
                                <span>{item.name}</span>
                                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/60">
                        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">System</p>
                        {managementItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                        active
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Icon size={18} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-gray-800/60 p-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-150 text-[13px] font-medium"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
