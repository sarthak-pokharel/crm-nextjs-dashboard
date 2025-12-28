'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { apiClient } from '@/lib/api-client';
import { Shield, Users, Plus, Edit2 } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

interface RoleFormState {
    name: string;
    description: string;
    isActive: boolean;
}

const emptyForm: RoleFormState = { name: '', description: '', isActive: true };

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState<RoleFormState>(emptyForm);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await apiClient('/roles', { method: 'GET' });
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setErrors({});
        setIsSubmitting(false);
    };

    const openCreate = () => {
        resetForm();
        setEditingRole(null);
        setShowCreate(true);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            isActive: role.isActive,
        });
        setErrors({});
        setShowEdit(true);
    };

    const handleCreate = async () => {
        if (!form.name.trim()) {
            setErrors({ name: 'Name is required' });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient('/roles', {
                method: 'POST',
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    isActive: form.isActive,
                }),
            });
            setShowCreate(false);
            resetForm();
            await fetchRoles();
        } catch (error: any) {
            setErrors(error.errors || { general: 'Failed to create role' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingRole) return;
        if (!form.name.trim()) {
            setErrors({ name: 'Name is required' });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient(`/roles/${editingRole.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    isActive: form.isActive,
                }),
            });
            setShowEdit(false);
            resetForm();
            setEditingRole(null);
            await fetchRoles();
        } catch (error: any) {
            setErrors(error.errors || { general: 'Failed to update role' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Role Name',
            render: (value: string, row: Role) => (
                <Link href={`/roles/${row.id}`} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
                    <Shield size={16} className="text-blue-600" />
                    <span className="font-medium">{value}</span>
                </Link>
            ),
        },
        { key: 'description', label: 'Description' },
        {
            key: 'isActive',
            label: 'Status',
            render: (value: boolean) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {value ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (value: string) => new Date(value).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: Role) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(row)}
                        title="Edit role"
                    >
                        <Edit2 size={14} />
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return <div className="flex items-center justify-center h-64 text-gray-500">Loading roles...</div>;
    }

    return (
        <div>
            <Header
                title="Roles & Permissions"
                description="Manage system roles and their permissions"
            />

            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={20} />
                    <span>{roles.length} roles</span>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} className="mr-2" />
                    Create Role
                </Button>
            </div>

            <Table columns={columns} data={roles} />

            {/* Create Role Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Create Role</h3>
                                <p className="text-sm text-gray-500">Define a new role and its status.</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => { setShowCreate(false); resetForm(); }}>Close</Button>
                        </div>

                        {errors.general && (
                            <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                                {errors.general}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Admin"
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <Textarea
                                    name="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="create-active"
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="create-active" className="text-sm text-gray-700">Active</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm(); }} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Role'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {showEdit && editingRole && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Edit Role</h3>
                                <p className="text-sm text-gray-500">Update name, description, or status.</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => { setShowEdit(false); resetForm(); setEditingRole(null); }}>Close</Button>
                        </div>

                        {errors.general && (
                            <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                                {errors.general}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Role name"
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <Textarea
                                    name="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="edit-active"
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="edit-active" className="text-sm text-gray-700">Active</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => { setShowEdit(false); resetForm(); setEditingRole(null); }} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}