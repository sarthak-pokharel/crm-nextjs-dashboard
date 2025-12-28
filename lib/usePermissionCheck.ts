'use client';
import {
  PermissionRequirement,
  PermissionScope,
  UserPermission,
  checkPermissionRequirement,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from '@/lib/permissions';
import { usePermissionsContext } from './PermissionsProvider';
export function usePermissionCheck() {
  const { permissions } = usePermissionsContext();
  return {
    can: (
      permission: string,
      scope: PermissionScope = PermissionScope.GLOBAL
    ) => hasPermission(permissions, permission, scope),
    canRead: (resource: string, scope?: PermissionScope) =>
      hasPermission(permissions, `${resource}:read`, scope),
    canCreate: (resource: string, scope?: PermissionScope) =>
      hasPermission(permissions, `${resource}:create`, scope),
    canUpdate: (resource: string, scope?: PermissionScope) =>
      hasPermission(permissions, `${resource}:update`, scope),
    canDelete: (resource: string, scope?: PermissionScope) =>
      hasPermission(permissions, `${resource}:delete`, scope),
    canAll: (permissions: string[], scope?: PermissionScope) =>
      hasAllPermissions(permissions, permissions, scope),
    canAny: (permissions: string[], scope?: PermissionScope) =>
      hasAnyPermission(permissions, permissions, scope),
    checkRequirement: (
      requirement: PermissionRequirement,
      scope?: PermissionScope
    ) => checkPermissionRequirement(permissions, requirement, scope),
    permissions,
  };
}
export function usePermissions() {
  const { permissions, isLoading, error } = usePermissionsContext();
  return {
    permissions,
    isLoading,
    error,
  };
}

/**
 * Hook to refetch permissions (useful after login)
 */
export function useRefreshPermissions() {
  const { refetch } = usePermissionsContext();
  return refetch;
}
