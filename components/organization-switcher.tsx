'use client';

import { useState, useEffect } from 'react';
import { usePermissionsContext } from '@/lib/PermissionsProvider';
import { apiClient } from '@/lib/api-client';

interface Organization {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    roleName: string;
}

export function OrganizationSwitcher() {
    const { organizationId, refetch } = usePermissionsContext();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await apiClient('/auth/me', { method: 'GET' });
            setOrganizations(response.organizations || []);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchOrganization = async (orgId: number) => {
        localStorage.setItem('currentOrgId', orgId.toString());
        setIsOpen(false);
        await refetch(); // Refetch permissions for the new organization
        window.location.reload(); // Reload to refresh all data
    };

    const currentOrg = organizations.find(org => org.id === organizationId);

    if (isLoading || organizations.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
                {currentOrg?.logo && (
                    <img src={currentOrg.logo} alt="" className="w-5 h-5 rounded" />
                )}
                <div className="flex flex-col items-start">
                    <span className="font-medium">{currentOrg?.name || 'Select Organization'}</span>
                    {currentOrg?.roleName && (
                        <span className="text-xs text-gray-500">{currentOrg.roleName}</span>
                    )}
                </div>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-80 overflow-auto">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSwitchOrganization(org.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${org.id === organizationId ? 'bg-blue-50' : ''
                                    }`}
                            >
                                {org.logo && (
                                    <img src={org.logo} alt="" className="w-6 h-6 rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{org.name}</div>
                                    <div className="text-xs text-gray-500">{org.roleName}</div>
                                </div>
                                {org.id === organizationId && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
