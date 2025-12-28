'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { apiClient } from '@/lib/api-client';
import { Building2, Plus, Users, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

interface OrgStats {
    id: number;
    name: string;
    memberCount: number;
    uniqueRolesCount: number;
}

export default function OrganizationsPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [stats, setStats] = useState<Record<number, OrgStats>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<number | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const data = await apiClient('/organizations', { method: 'GET' });
            setOrganizations(data);
            
            // Fetch stats for each organization
            const statsData: Record<number, OrgStats> = {};
            for (const org of data) {
                try {
                    const stat = await apiClient(`/organizations/${org.id}/stats`, { method: 'GET' });
                    statsData[org.id] = stat;
                } catch (error) {
                    console.error(`Failed to fetch stats for org ${org.id}:`, error);
                }
            }
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiClient(`/organizations/${id}`, { method: 'DELETE' });
            setOrganizations(organizations.filter(org => org.id !== id));
            const newStats = { ...stats };
            delete newStats[id];
            setStats(newStats);
        } catch (error) {
            console.error('Failed to delete organization:', error);
            alert('Failed to delete organization');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (value: string, row: Organization) => (
                <div className="space-y-1">
                    <Link
                        href={`/organizations/${row.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        {value}
                    </Link>
                    <p className="text-xs text-gray-500">{row.slug}</p>
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            render: (value?: string) => (
                <p className="text-sm text-gray-600">{value || '—'}</p>
            ),
        },
        {
            key: 'id',
            label: 'Members',
            render: (_: any, row: Organization) => {
                const orgStats = stats[row.id];
                return (
                    <span className="text-sm">
                        {orgStats ? `${orgStats.memberCount} members` : '—'}
                    </span>
                );
            },
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (value: boolean) => (
                <span
                    className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        value
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {value ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: Organization) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/organizations/${row.id}`)}
                        title="View details"
                    >
                        <Eye size={16} />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/organizations/${row.id}/users`)}
                        title="Manage users"
                    >
                        <Users size={16} />
                    </Button>
                    <div className="relative">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                        >
                            <MoreVertical size={16} />
                        </Button>
                        {openMenu === row.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 border-b"
                                    onClick={() => {
                                        router.push(`/organizations/${row.id}`);
                                        setOpenMenu(null);
                                    }}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    onClick={() => {
                                        handleDelete(row.id, row.name);
                                        setOpenMenu(null);
                                    }}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading organizations...</div>
            </div>
        );
    }

    return (
        <div>
            <Header
                title="Organizations"
                description="Manage organizations, members, and settings"
            />

            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={20} />
                    <span className="font-medium">{organizations.length} organizations</span>
                </div>
                <Link href="/organizations/new">
                    <Button>
                        <Plus size={20} className="mr-2" />
                        Create Organization
                    </Button>
                </Link>
            </div>

            {organizations.length === 0 ? (
                <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No organizations yet</p>
                    <Link href="/organizations/new">
                        <Button>
                            <Plus size={16} className="mr-2" />
                            Create Your First Organization
                        </Button>
                    </Link>
                </div>
            ) : (
                <Table columns={columns} data={organizations} />
            )}
        </div>
    );
}
