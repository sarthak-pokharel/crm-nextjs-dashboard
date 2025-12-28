// Frontend permission constants matching backend
export enum PermissionScope {
  GLOBAL = 'global',
  COMPANY = 'company',
  DEPARTMENT = 'department',
  TEAM = 'team',
  SELF = 'self',
}

export enum PermissionOperator {
  AND = 'AND',
  OR = 'OR',
}

export interface PermissionRequirement {
  operator?: PermissionOperator;
  permissions: string[];
}

export const Owner = Symbol('OWNER');

// Helper functions to create permission requirements
export function AND(...permissions: (string | symbol)[]): PermissionRequirement {
  return {
    operator: PermissionOperator.AND,
    permissions: permissions.map(p => (typeof p === 'symbol' ? p.toString() : p)),
  };
}

export function OR(...permissions: (string | symbol)[]): PermissionRequirement {
  return {
    operator: PermissionOperator.OR,
    permissions: permissions.map(p => (typeof p === 'symbol' ? p.toString() : p)),
  };
}

// User permission data structure
export interface UserPermission {
  permission: string;
  scope: PermissionScope;
  organizationId?: number | null;
}

export interface UserPermissions {
  userId: number;
  organizationId?: number;
  permissions: UserPermission[];
}

// Scope hierarchy
export const SCOPE_HIERARCHY: Record<PermissionScope, PermissionScope[]> = {
  [PermissionScope.GLOBAL]: [
    PermissionScope.COMPANY,
    PermissionScope.DEPARTMENT,
    PermissionScope.TEAM,
    PermissionScope.SELF,
  ],
  [PermissionScope.COMPANY]: [
    PermissionScope.DEPARTMENT,
    PermissionScope.TEAM,
    PermissionScope.SELF,
  ],
  [PermissionScope.DEPARTMENT]: [
    PermissionScope.TEAM,
    PermissionScope.SELF,
  ],
  [PermissionScope.TEAM]: [
    PermissionScope.SELF,
  ],
  [PermissionScope.SELF]: [],
};

/**
 * Check if a user has a specific permission with a given scope
 */
export function hasPermission(
  permissions: UserPermission[],
  requiredPermission: string,
  requiredScope: PermissionScope = PermissionScope.GLOBAL
): boolean {
  return permissions.some(p => {
    if (p.permission !== requiredPermission) return false;
    // Check if user's scope is equal or higher in hierarchy
    return (
      p.scope === requiredScope ||
      SCOPE_HIERARCHY[p.scope]?.includes(requiredScope)
    );
  });
}

/**
 * Check multiple permissions with AND operator (all required)
 */
export function hasAllPermissions(
  permissions: UserPermission[],
  requiredPermissions: string[],
  scope: PermissionScope = PermissionScope.GLOBAL
): boolean {
  return requiredPermissions.every(perm =>
    hasPermission(permissions, perm, scope)
  );
}

/**
 * Check multiple permissions with OR operator (at least one required)
 */
export function hasAnyPermission(
  permissions: UserPermission[],
  requiredPermissions: string[],
  scope: PermissionScope = PermissionScope.GLOBAL
): boolean {
  return requiredPermissions.some(perm =>
    hasPermission(permissions, perm, scope)
  );
}

/**
 * Check a permission requirement (handles AND/OR operators)
 */
export function checkPermissionRequirement(
  permissions: UserPermission[],
  requirement: PermissionRequirement,
  scope: PermissionScope = PermissionScope.GLOBAL
): boolean {
  const operator = requirement.operator || PermissionOperator.OR;

  if (operator === PermissionOperator.AND) {
    return hasAllPermissions(permissions, requirement.permissions, scope);
  } else {
    return hasAnyPermission(permissions, requirement.permissions, scope);
  }
}
