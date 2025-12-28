'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Trash2, AlertCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface OrgStats {
    memberCount: number;
    uniqueRolesCount: number;
    createdAt: string;
}

export default function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap the async params
    const { id: paramsId } = use(params);
    
    const [orgId, setOrgId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [organization, setOrganization] = useState<any>(null);
    const [stats, setStats] = useState<OrgStats | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    console.log('[EditOrg] paramsId:', paramsId);

    useEffect(() => {
        if (!paramsId) return;

        const parsedOrgId = parseInt(paramsId);
        if (isNaN(parsedOrgId) || parsedOrgId <= 0) {
            console.error('[EditOrg] Invalid ID:', paramsId);
            setIsFetching(false);
            return;
        }

        setOrgId(parsedOrgId);

        const fetchOrganization = async () => {
            try {
                console.log('[EditOrg] Fetching organization:', parsedOrgId);
                const [orgData, statsData] = await Promise.all([
                    apiClient(`/organizations/${parsedOrgId}`, { method: 'GET' }),
                    apiClient(`/organizations/${parsedOrgId}/stats`, { method: 'GET' }).catch(() => null),
                ]);
                console.log('[EditOrg] Fetched org data:', orgData);
                setOrganization(orgData);
                setStats(statsData);
            } catch (error) {
                console.error('[EditOrg] Failed to fetch organization:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchOrganization();
    }, [paramsId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        if (!orgId) return;

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await apiClient(`/organizations/${orgId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            router.push('/organizations');
        } catch (error: any) {
            setErrors(error.errors || { general: 'Failed to update organization' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!orgId) return;
        
        setIsDeleting(true);
        try {
            await apiClient(`/organizations/${orgId}`, {
                method: 'DELETE',
            });
            router.push('/organizations');
        } catch (error: any) {
            alert(error.errors?.general || 'Failed to delete organization');
            setIsDeleting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading organization...</div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-center">
                    <p className="text-red-600 font-semibold mb-2">Organization not found</p>
                    <p className="text-gray-600 text-sm mb-4">The organization you're trying to access doesn't exist or has been deleted.</p>
                    <Link href="/organizations" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Back to Organizations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Link href="/organizations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
                <ArrowLeft size={16} />
                Back to Organizations
            </Link>

            <Header
                title="Edit Organization"
                description={`Update ${organization.name} settings`}
            />

            {/* Stats Section */}
            {stats && (
                <div className="mb-8 grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Members</p>
                        <p className="text-2xl font-bold">{stats.memberCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Roles</p>
                        <p className="text-2xl font-bold">{stats.uniqueRolesCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="text-2xl font-bold">{organization.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <Form onSubmit={handleSubmit} isLoading={isLoading}>
                        <Input
                            name="name"
                            label="Organization Name"
                            defaultValue={organization.name}
                            required
                            error={errors.name}
                        />

                        <Input
                            name="slug"
                            label="Slug"
                            defaultValue={organization.slug}
                            error={errors.slug}
                            helperText="Unique identifier for the organization"
                        />

                        <Textarea
                            name="description"
                            label="Description"
                            defaultValue={organization.description}
                            error={errors.description}
                        />

                        <Input
                            name="website"
                            label="Website"
                            type="url"
                            defaultValue={organization.website}
                            error={errors.website}
                        />

                        <Input
                            name="logo"
                            label="Logo URL"
                            type="url"
                            defaultValue={organization.logo}
                            error={errors.logo}
                        />

                        {errors.general && (
                            <div className="text-red-600 text-sm">{errors.general}</div>
                        )}

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading} variant="primary">
                                {isLoading ? 'Updating...' : 'Update Organization'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </div>

                {/* Sidebar Actions */}
                <div className="col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Quick Actions</h3>
                        
                        <Link href={`/organizations/${orgId || ''}/users`} className="w-full mb-3 inline-block">
                            <Button variant="secondary" className="w-full">
                                <Users size={16} className="mr-2" />
                                Manage Members
                            </Button>
                        </Link>

                        <hr className="my-4" />

                        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                            <div className="flex gap-2 mb-3">
                                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900 text-sm">Danger Zone</p>
                                    <p className="text-xs text-red-700 mt-1">
                                        Deleting this organization is permanent and cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete Organization
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={24} className="text-red-600" />
                            <h2 className="text-xl font-bold">Delete Organization?</h2>
                        </div>
                        <p className="text-gray-600 mb-2">
                            You are about to delete <strong>{organization.name}</strong>.
                        </p>
                        <p className="text-gray-600 mb-6 text-sm">
                            This action cannot be undone. All associated data will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                variant="primary"
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
