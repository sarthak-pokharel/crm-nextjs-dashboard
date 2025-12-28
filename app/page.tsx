'use client';

import { Building2, Users, Briefcase, CheckSquare } from 'lucide-react';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/button';
import { useCompanies, useLeads, useDeals, useMyTasks } from '@/lib/hooks';
import { usePermissions } from '@/lib/usePermissionCheck';

export default function Home() {
  // Wait for permissions to load first
  const { isLoading: permissionsLoading } = usePermissions();
  
  // Only fetch data after permissions are loaded
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();

  // Show loading state while permissions are being fetched
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your CRM."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Companies"
          value={companies?.length || 0}
          icon={<Building2 size={24} />}
        />
        <StatCard
          label="Leads"
          value={leads?.length || 0}
          icon={<Users size={24} />}
        />
        <StatCard
          label="Active Deals"
          value={deals?.length || 0}
          icon={<Briefcase size={24} />}
        />
        <StatCard
          label="My Tasks"
          value={tasks?.length || 0}
          icon={<CheckSquare size={24} />}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button href="/companies">View Companies</Button>
          <Button href="/leads" variant="secondary">Manage Leads</Button>
          <Button href="/deals" variant="outline">View Deals</Button>
          <Button href="/tasks" variant="outline">My Tasks</Button>
        </div>
      </div>
    </div>
  );
}
