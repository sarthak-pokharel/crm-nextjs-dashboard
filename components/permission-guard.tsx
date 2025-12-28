'use client';

import { ReactNode } from 'react';
import {
    PermissionRequirement,
    PermissionScope,
    UserPermission,
    checkPermissionRequirement,
} from '@/lib/permissions';

interface PermissionGuardProps {
    requires: PermissionRequirement | string;
    scope?: PermissionScope;
    userPermissions: UserPermission[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * PermissionGuard - Wrapper component to conditionally render content based on permissions
 *
 * @example
 * // Single permission
 * <PermissionGuard
 *   requires="lead:read"
 *   userPermissions={permissions}
 * >
 *   <LeadsList />
 * </PermissionGuard>
 *
 * @example
 * // OR operator
 * <PermissionGuard
 *   requires={OR('lead:read', 'lead:write')}
 *   userPermissions={permissions}
 * >
 *   <LeadAction />
 * </PermissionGuard>
 *
 * @example
 * // AND operator
 * <PermissionGuard
 *   requires={AND('lead:write', 'lead:approve')}
 *   userPermissions={permissions}
 * >
 *   <ApproveButton />
 * </PermissionGuard>
 *
 * @example
 * // With custom scope
 * <PermissionGuard
 *   requires="lead:delete"
 *   scope={PermissionScope.COMPANY}
 *   userPermissions={permissions}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * // With fallback UI
 * <PermissionGuard
 *   requires="lead:admin"
 *   userPermissions={permissions}
 *   fallback={<div>You don't have permission to access this</div>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
    requires,
    scope = PermissionScope.GLOBAL,
    userPermissions,
    children,
    fallback,
}: PermissionGuardProps) {
    // Normalize string to PermissionRequirement
    const requirement =
        typeof requires === 'string'
            ? { permissions: [requires] }
            : requires;

    // Check if user has required permissions
    const hasPermission = checkPermissionRequirement(
        userPermissions,
        requirement,
        scope
    );

    if (!hasPermission) {
        return fallback || null;
    }

    return <>{children}</>;
}

/**
 * Higher-order component to wrap a component with permission guard
 */
export function withPermissionGuard<P extends object>(
    Component: React.ComponentType<P>,
    requires: PermissionRequirement | string,
    scope?: PermissionScope,
    fallback?: ReactNode
) {
    return function ProtectedComponent(
        props: P & { userPermissions: UserPermission[] }
    ) {
        const { userPermissions, ...componentProps } = props;

        return (
            <PermissionGuard
                requires={requires}
                scope={scope}
                userPermissions={userPermissions}
                fallback={fallback}
            >
                <Component {...(componentProps as P)} />
            </PermissionGuard>
        );
    };
}
