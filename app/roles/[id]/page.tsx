'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { ACTION_HEADERS, PERMISSION_MATRIX } from '../permissions-config';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

interface RolePermissionResponse {
    permissionKey: string;
    scope?: string;
}

export default function RoleDetailPage() {
    const params = useParams();
    const idParam = params?.id;
    const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
    const roleId = useMemo(() => Number.parseInt(idValue ?? '', 10), [idValue]);
    const invalidRoleId = useMemo(() => Number.isNaN(roleId), [roleId]);
    const [role, setRole] = useState<Role | null>(null);
    const [permissionSelection, setPermissionSelection] = useState<Record<string, boolean>>({});
    const [roleError, setRoleError] = useState<string | null>(null);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (invalidRoleId) {
            setRoleError('Invalid role id');
            setLoadingRole(false);
            setLoadingPermissions(false);
            return;
        }

        loadRole();
        loadPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invalidRoleId, roleId]);

    const loadRole = async () => {
        setLoadingRole(true);
        setRoleError(null);
        try {
            const found: Role = await apiClient(`/roles/${roleId}`, { method: 'GET' });
            setRole(found ?? null);
            if (!found) setRoleError('Role not found');
        } catch (error) {
            console.error('Failed to load role', error);
            setRoleError('Failed to load role');
        } finally {
            setLoadingRole(false);
        }
    };

    const loadPermissions = async () => {
        setLoadingPermissions(true);
        setPermissionsError(null);
        try {
            const data: RolePermissionResponse[] = await apiClient(`/roles/${roleId}/permissions`, { method: 'GET' });
            const mapped: Record<string, boolean> = {};
            data.forEach(p => {
                mapped[p.permissionKey] = true;
            });
            setPermissionSelection(mapped);
        } catch (error) {
            console.error('Failed to load permissions', error);
            setPermissionsError('Failed to load permissions for this role.');
        } finally {
            setLoadingPermissions(false);
        }
    };

    const togglePermission = (permissionKey?: string) => {
        if (!permissionKey) return;
        setPermissionSelection(prev => {
            const next = { ...prev };
            if (next[permissionKey]) {
                delete next[permissionKey];
            } else {
                next[permissionKey] = true;
            }
            return next;
        });
    };

    const handleSavePermissions = async () => {
        setSaving(true);
        setPermissionsError(null);
        try {
            const payload = Object.keys(permissionSelection).map(permissionKey => ({ permissionKey }));
            await apiClient(`/roles/${roleId}/permissions`, {
                method: 'PUT',
                body: JSON.stringify({ permissions: payload }),
            });
        } catch (error) {
            console.error('Failed to save permissions', error);
            setPermissionsError('Could not save permissions. Please retry.');
        } finally {
            setSaving(false);
        }
    };

    if (invalidRoleId) {
        return (
            <div className="space-y-6">
                <Header title="Role Permissions" description="Toggle which permissions this role has." />
                <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">Invalid role id</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Header title="Role Permissions" description="Toggle which permissions this role has." />

            <div className="flex items-center justify-between">
                <Link href="/roles" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <ArrowLeft size={16} />
                    Back to roles
                </Link>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => loadPermissions()} disabled={loadingPermissions || saving}>
                        Reload
                    </Button>
                    <Button onClick={handleSavePermissions} disabled={saving || loadingPermissions || !!permissionsError}>
                        {saving ? 'Saving...' : 'Save Permissions'}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {loadingRole ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={16} />
                        Loading role...
                    </div>
                ) : role ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Shield size={18} className="text-blue-600" />
                            {role.name}
                        </div>
                        {role.description && <p className="text-sm text-gray-600">{role.description}</p>}
                        <div className="text-sm text-gray-600">
                            Status:{' '}
                            <span className={`px-2 py-1 text-xs rounded-full ${role.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {role.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">Created {new Date(role.createdAt).toLocaleString()}</div>
                    </div>
                ) : (
                    <div className="text-red-600 text-sm">{roleError || 'Role not found'}</div>
                )}
            </div>

            {permissionsError && (
                <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                    {permissionsError}
                </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="grid grid-cols-[1.3fr_repeat(4,1fr)_1fr] bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <div className="px-4 py-3">Entity</div>
                    {ACTION_HEADERS.map(header => (
                        <div key={header.key} className="px-4 py-3 text-center">{header.label}</div>
                    ))}
                    <div className="px-4 py-3 text-center">Other</div>
                </div>

                {loadingPermissions ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Loading permissions...
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {PERMISSION_MATRIX.map(row => (
                            <div key={row.resource} className="grid grid-cols-[1.3fr_repeat(4,1fr)_1fr]">
                                <div className="px-4 py-3 flex items-center font-medium text-gray-800 border-r border-gray-100">{row.label}</div>
                                {ACTION_HEADERS.map(header => {
                                    const permissionKey = row[header.key];
                                    const isChecked = permissionKey ? Boolean(permissionSelection[permissionKey]) : false;
                                    return (
                                        <div key={header.key} className="px-4 py-3 flex flex-col gap-2 items-center justify-center border-r border-gray-100">
                                            {permissionKey ? (
                                                <label className="flex items-center gap-2 text-sm text-gray-800">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(permissionKey)}
                                                        disabled={saving}
                                                    />
                                                    <span className="sr-only">Toggle {header.label}</span>
                                                </label>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </div>
                                    );
                                })}
                                <div className="px-4 py-3 border-gray-100 flex flex-wrap gap-2 items-center">
                                    {row.extra && row.extra.length > 0 ? (
                                        row.extra.map(extra => {
                                            const isChecked = Boolean(permissionSelection[extra.key]);
                                            return (
                                                <div key={extra.key} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(extra.key)}
                                                        disabled={saving}
                                                    />
                                                    <span className="text-xs text-gray-700">{extra.label}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
