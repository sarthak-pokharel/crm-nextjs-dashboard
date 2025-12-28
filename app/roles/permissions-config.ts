export type PermissionAction = 'read' | 'update' | 'create' | 'delete';

export type PermissionCell = Partial<Record<PermissionAction, string>> & {
    resource: string;
    label: string;
    extra?: { label: string; key: string }[];
};

export const ACTION_HEADERS: { key: PermissionAction; label: string }[] = [
    { key: 'read', label: 'Read' },
    { key: 'update', label: 'Edit' },
    { key: 'create', label: 'Write' },
    { key: 'delete', label: 'Delete' },
];

export const PERMISSION_MATRIX: PermissionCell[] = [
    {
        resource: 'User',
        label: 'Users',
        read: 'user:read',
        create: 'user:create',
        update: 'user:update',
        delete: 'user:delete',
    },
    {
        resource: 'Company',
        label: 'Companies',
        read: 'company:read',
        create: 'company:create',
        update: 'company:update',
        delete: 'company:delete',
    },
    {
        resource: 'Lead',
        label: 'Leads',
        read: 'lead:read',
        create: 'lead:create',
        update: 'lead:update',
        delete: 'lead:delete',
        extra: [{ label: 'Assign', key: 'lead:assign' }],
    },
    {
        resource: 'Contact',
        label: 'Contacts',
        read: 'contact:read',
        create: 'contact:create',
        update: 'contact:update',
        delete: 'contact:delete',
    },
    {
        resource: 'Deal',
        label: 'Deals',
        read: 'deal:read',
        create: 'deal:create',
        update: 'deal:update',
        delete: 'deal:delete',
        extra: [
            { label: 'Approve', key: 'deal:approve' },
            { label: 'Close', key: 'deal:close' },
        ],
    },
    {
        resource: 'Activity',
        label: 'Activities',
        read: 'activity:read',
        create: 'activity:create',
        update: 'activity:update',
        delete: 'activity:delete',
    },
    {
        resource: 'Task',
        label: 'Tasks',
        read: 'task:read',
        create: 'task:create',
        update: 'task:update',
        delete: 'task:delete',
        extra: [
            { label: 'Assign', key: 'task:assign' },
            { label: 'Complete', key: 'task:complete' },
        ],
    },
    {
        resource: 'Organization',
        label: 'Organizations',
        read: 'organization:read',
        create: 'organization:create',
        update: 'organization:update',
        delete: 'organization:delete',
        extra: [{ label: 'Manage Users', key: 'organization:manage_users' }],
    },
    {
        resource: 'Role',
        label: 'Roles',
        read: 'role:read',
        create: 'role:create',
        update: 'role:update',
        delete: 'role:delete',
    },
    {
        resource: 'Permission',
        label: 'Permissions',
        read: 'permission:read',
        update: 'permission:assign',
    },
    {
        resource: 'Content',
        label: 'Content',
        read: 'content:read',
        create: 'content:create',
        update: 'content:update',
        delete: 'content:delete',
        extra: [{ label: 'Publish', key: 'content:publish' }],
    },
];

