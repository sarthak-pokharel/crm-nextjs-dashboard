'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { Modal } from '@/components/modal';
import { Select } from '@/components/select';
import { apiClient } from '@/lib/api-client';
import { UserPlus, Trash2, ArrowLeft, Edit2, Shield } from 'lucide-react';
import Link from 'next/link';

interface OrgUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleId: number;
    roleName: string;
    assignedAt: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
}

export default function OrganizationUsersPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: paramsId } = use(params);
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [orgId, setOrgId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
    const [organization, setOrganization] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!paramsId) return;

        const parsedId = parseInt(paramsId);
        if (isNaN(parsedId) || parsedId <= 0) {
            console.error('[OrgUsers] Invalid ID:', paramsId);
            setIsLoading(false);
            return;
        }

        setOrgId(parsedId);
        fetchData(parsedId);
    }, [paramsId]);

    const fetchData = async (id: number) => {
        try {
            const [orgData, usersData, allUsers, rolesData] = await Promise.all([
                apiClient(`/organizations/${id}`, { method: 'GET' }),
                apiClient(`/organizations/${id}/users`, { method: 'GET' }),
                apiClient('/auth/users', { method: 'GET' }).catch(() => []),
                apiClient('/roles', { method: 'GET' }).catch(() => []),
            ]);

            setOrganization(orgData);
            setUsers(usersData);
            setAvailableUsers(allUsers);
            setRoles(rolesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignUser = async () => {
        if (!selectedUserId || !selectedRoleId || !orgId) return;

        setIsSubmitting(true);
        try {
            await apiClient(`/organizations/${orgId}/users`, {
                method: 'POST',
                body: JSON.stringify({
                    userId: parseInt(selectedUserId),
                    roleId: parseInt(selectedRoleId),
                }),
            });
            setShowAddModal(false);
            setSelectedUserId('');
            setSelectedRoleId('');
            await fetchData(orgId);
        } catch (error: any) {
            console.error('Failed to assign user:', error);
            alert(error.errors?.general || 'Failed to assign user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUserRole = async () => {
        if (!editingUser || !selectedRoleId || !orgId) return;

        setIsSubmitting(true);
        try {
            await apiClient(`/organizations/${orgId}/users/${editingUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    roleId: parseInt(selectedRoleId),
                }),
            });
            setShowEditModal(false);
            setEditingUser(null);
            setSelectedRoleId('');
            await fetchData(orgId);
        } catch (error: any) {
            console.error('Failed to update user role:', error);
            alert(error.errors?.general || 'Failed to update user role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnassignUser = async (userId: number, userName: string) => {
        if (!confirm(`Remove ${userName} from this organization?`)) {
            return;
        }

        if (!orgId) return;

        try {
            await apiClient(`/organizations/${orgId}/users/${userId}`, {
                method: 'DELETE',
            });
            await fetchData(orgId);
        } catch (error) {
            console.error('Failed to unassign user:', error);
            alert('Failed to remove user');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (_: any, row: OrgUser) => (
                <div>
                    <p className="font-medium">{row.firstName} {row.lastName}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                </div>
            ),
        },
        {
            key: 'roleName',
            label: 'Role',
            render: (value: string) => (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                    <Shield size={14} />
                    {value}
                </span>
            ),
        },
        {
            key: 'assignedAt',
            label: 'Assigned',
            render: (value: string) => {
                const date = new Date(value);
                return <span className="text-sm text-gray-600">{date.toLocaleDateString()}</span>;
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, row: OrgUser) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setEditingUser(row);
                            setSelectedRoleId(row.roleId.toString());
                            setShowEditModal(true);
                        }}
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUnassignUser(row.id, `${row.firstName} ${row.lastName}`)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6 text-sm text-blue-600">
                <Link href="/organizations" className="inline-flex items-center gap-2 hover:text-blue-700">
                    <ArrowLeft size={14} />
                    Organizations
                </Link>
                <span className="text-gray-400">/</span>
                {orgId ? (
                    <Link href={`/organizations/${orgId}`} className="hover:text-blue-700">
                        {organization?.name || `Organization #${orgId}`}
                    </Link>
                ) : (
                    <span className="text-gray-500">Organization</span>
                )}
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-medium">Members</span>
            </div>

            <Header
                title={`${organization?.name || 'Organization'} Members`}
                description="Manage users and assign roles in this organization"
            />

            <div className="mb-6 flex justify-between items-center">
                <div className="text-sm text-gray-600 font-medium">{users.length} members</div>
                <Button onClick={() => {
                    setSelectedUserId('');
                    setSelectedRoleId('');
                    setShowAddModal(true);
                }}>
                    <UserPlus size={18} className="mr-2" />
                    Invite Member
                </Button>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                    <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No members assigned yet</p>
                    <Button onClick={() => setShowAddModal(true)}>
                        <UserPlus size={16} className="mr-2" />
                        Invite Your First Member
                    </Button>
                </div>
            ) : (
                <Table columns={columns} data={users} />
            )}

            {/* Add User Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Invite Member"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a user...</option>
                            {availableUsers.map((u) => (
                                <option key={u.id} value={u.id.toString()}>
                                    {u.firstName} {u.lastName} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a role...</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id.toString()}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowAddModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignUser}
                            disabled={!selectedUserId || !selectedRoleId || isSubmitting}
                        >
                            {isSubmitting ? 'Inviting...' : 'Invite Member'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Role Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                }}
                title={`Update Role for ${editingUser?.firstName} ${editingUser?.lastName}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a role...</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id.toString()}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingUser(null);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateUserRole}
                            disabled={!selectedRoleId || isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
