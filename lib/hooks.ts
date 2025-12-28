import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFetchWithAuth } from './api-client';
import { usePermissions } from './usePermissionCheck';

const fetcher = createFetchWithAuth();

// Company Hooks
export function useCompanies() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => fetcher('/companies'),
    enabled: !permissionsLoading, // Only fetch after permissions are loaded
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => fetcher(`/companies/${id}`),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/companies', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

// Lead Hooks
export function useLeads() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetcher('/leads'),
    enabled: !permissionsLoading,
  });
}

export function useLead(id: number) {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => fetcher(`/leads/${id}`),
    enabled: !!id && !permissionsLoading,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher('/leads', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

// Contact Hooks
export function useContacts() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => fetcher('/contacts'),
    enabled: !permissionsLoading,
  });
}

export function useContact(id: number) {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => fetcher(`/contacts/${id}`),
    enabled: !!id && !permissionsLoading,
  });
}

// Deal Hooks
export function useDeals() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['deals'],
    queryFn: () => fetcher('/deals'),
    enabled: !permissionsLoading,
  });
}

export function useDeal(id: number) {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => fetcher(`/deals/${id}`),
    enabled: !!id && !permissionsLoading,
  });
}

export function useDealsPipeline() {
  return useQuery({
    queryKey: ['deals', 'pipeline'],
    queryFn: () => fetcher('/deals/pipeline'),
  });
}

// Activity Hooks
export function useActivities() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => fetcher('/activities'),
    enabled: !permissionsLoading,
  });
}

// Task Hooks
export function useTasks() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetcher('/tasks'),
    enabled: !permissionsLoading,
  });
}

export function useTask(id: number) {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => fetcher(`/tasks/${id}`),
    enabled: !!id && !permissionsLoading,
  });
}

export function useMyTasks() {
  const { isLoading: permissionsLoading } = usePermissions();
  
  return useQuery({
    queryKey: ['tasks', 'my-tasks'],
    queryFn: () => fetcher('/tasks/my-tasks'),
    enabled: !permissionsLoading,
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => fetcher('/tasks/overdue'),
  });
}

// Additional hooks for detail pages
export function useActivity(id: number) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => fetcher(`/activities/${id}`),
    enabled: !!id,
  });
}
