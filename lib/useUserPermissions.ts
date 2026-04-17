'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { UserPermissions } from './permissions';

/**
 * Fetch user permissions from the backend
 */
export function useUserPermissions() {
  return useQuery({
    queryKey: ['userPermissions'],
    queryFn: async () => {
      try {
        const response = await apiClient('/auth/permissions');
        return response as UserPermissions;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        return { userId: 0, permissions: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
