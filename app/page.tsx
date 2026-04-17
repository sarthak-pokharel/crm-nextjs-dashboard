'use client';

import {
  Building2, Users, Handshake, ListTodo, TrendingUp, ArrowUpRight,
  Clock, Plus, Eye, CalendarDays, Target, DollarSign
} from 'lucide-react';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/button';
import { useCompanies, useLeads, useDeals, useMyTasks, useTasks, useActivities } from '@/lib/hooks';
import { usePermissions } from '@/lib/usePermissionCheck';

// Simple bar chart component (pure SVG, no dependencies)
function MiniBarChart({ data, color = '#3b82f6' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;
  return (
    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
      {data.map((val, i) => {
        const h = (val / max) * 36;
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={40 - h}
            width={barWidth * 0.7}
            height={h}
            rx={2}
            fill={color}
            opacity={0.15 + (i / data.length) * 0.85}
          />
        );
      })}
    </svg>
  );
}

// Donut chart for pipeline
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {segments.map((seg, i) => {
        const dashLength = (seg.value / total) * circumference;
        const dashOffset = -(cumulative / total) * circumference;
        cumulative += seg.value;
        return (
          <circle
            key={i}
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        );
      })}
      <text x="50" y="47" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize="14" fontWeight="700">
        {total}
      </text>
      <text x="50" y="59" textAnchor="middle" className="fill-gray-400" fontSize="7">
        Total Deals
      </text>
    </svg>
  );
}

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    qualified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    converted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    lost: 'bg-red-50 text-red-700 ring-red-600/20',
    unqualified: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colors[status] || colors.new}`}>
      {status}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    prospecting: 'bg-slate-50 text-slate-600 ring-slate-500/20',
    qualification: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    proposal: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    negotiation: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    closed_won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    closed_lost: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  const label = stage.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${colors[stage] || colors.prospecting}`}>
      {label}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-red-500' };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[priority] || colors.medium}`} />;
}

export default function Home() {
  const { isLoading: permissionsLoading } = usePermissions();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();
  const { data: activities } = useActivities();

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Pipeline data
  const stageColors: Record<string, string> = {
    prospecting: '#94a3b8',
    qualification: '#3b82f6',
    proposal: '#f59e0b',
    negotiation: '#8b5cf6',
    closed_won: '#10b981',
    closed_lost: '#ef4444',
  };

  const stageData = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(stage => ({
    label: stage.replace(/_/g, ' '),
    value: deals?.filter((d: any) => d.stage === stage).length || 0,
    color: stageColors[stage],
  }));

  const totalDealValue = deals?.reduce((sum: number, d: any) => sum + (parseFloat(d.value) || 0), 0) || 0;
  const wonDeals = deals?.filter((d: any) => d.stage === 'closed_won') || [];
  const wonValue = wonDeals.reduce((sum: number, d: any) => sum + (parseFloat(d.value) || 0), 0);
  const avgDealValue = deals?.length ? totalDealValue / deals.length : 0;

  // Lead status counts for bar chart
  const leadsByStatus = ['new', 'contacted', 'qualified', 'converted'].map(
    s => leads?.filter((l: any) => l.status === s).length || 0
  );

  // Recent leads (latest 5)
  const recentLeads = [...(leads || [])].slice(0, 5);
  // Top deals by value
  const topDeals = [...(deals || [])].sort((a: any, b: any) => parseFloat(b.value) - parseFloat(a.value)).slice(0, 5);
  // Upcoming tasks
  const pendingTasks = (tasks || []).filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled').slice(0, 5);
  // Recent activities
  const recentActivities = [...(activities || [])].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="Dashboard"
        description="Overview of your sales pipeline and activities"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" href="/leads/new"><Plus size={14} /> New Lead</Button>
            <Button size="sm" href="/deals/new"><Plus size={14} /> New Deal</Button>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Companies" value={companies?.length || 0} icon={<Building2 size={20} />} trend="+12% this month" subtitle="Active accounts" />
        <StatCard label="Active Leads" value={leads?.filter((l: any) => !['converted', 'lost', 'unqualified'].includes(l.status)).length || 0} icon={<Target size={20} />} trend="+8 this week" subtitle={`${leads?.length || 0} total`} />
        <StatCard label="Pipeline Value" value={`$${(totalDealValue / 1000).toFixed(0)}k`} icon={<DollarSign size={20} />} trend={`$${(wonValue / 1000).toFixed(0)}k won`} subtitle={`${deals?.length || 0} active deals`} />
        <StatCard label="My Tasks" value={pendingTasks.length} icon={<ListTodo size={20} />} trend={`${(tasks || []).filter((t: any) => t.status === 'completed').length} completed`} subtitle="Pending items" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline Donut */}
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Deal Pipeline</h3>
            <Button variant="ghost" size="sm" href="/deals"><Eye size={14} /> View All</Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-36 w-36 flex-shrink-0">
              <DonutChart segments={stageData} />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              {stageData.filter(s => s.value > 0).map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-gray-600 dark:text-gray-400 capitalize truncate">{seg.label}</span>
                  <span className="ml-auto font-semibold text-gray-900 dark:text-white">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lead Funnel</h3>
            <Button variant="ghost" size="sm" href="/leads"><Eye size={14} /> View All</Button>
          </div>
          <div className="h-32 mb-4">
            <MiniBarChart data={leadsByStatus} color="#3b82f6" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['New', 'Contacted', 'Qualified', 'Converted'].map((label, i) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{leadsByStatus[i]}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                  <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Won Revenue</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">${wonValue.toLocaleString()}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{wonDeals.length} deals</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                  <DollarSign size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Deal Size</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">${avgDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
                  <Users size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contacts</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{companies?.reduce((s: number, c: any) => s + 1, 0) || 0} companies</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                  <CalendarDays size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Activities</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{activities?.length || 0} logged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Deals */}
        <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Deals by Value</h3>
            <Button variant="ghost" size="sm" href="/deals">View All <ArrowUpRight size={13} /></Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {topDeals.map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{deal.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StageBadge stage={deal.stage} />
                    <span className="text-[11px] text-gray-400">{deal.probability}% prob.</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white ml-4">${parseFloat(deal.value).toLocaleString()}</p>
              </div>
            ))}
            {topDeals.length === 0 && <p className="px-5 py-6 text-center text-sm text-gray-400">No deals yet</p>}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
            <Button variant="ghost" size="sm" href="/leads">View All <ArrowUpRight size={13} /></Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {recentLeads.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{lead.companyName || lead.email}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <StatusBadge status={lead.status} />
                  {lead.score != null && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">{lead.score}pts</span>
                  )}
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="px-5 py-6 text-center text-sm text-gray-400">No leads yet</p>}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Tasks */}
        <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
            <Button variant="ghost" size="sm" href="/tasks">View All <ArrowUpRight size={13} /></Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {pendingTasks.map((task: any) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700">
                  <PriorityDot priority={task.priority} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-[11px] text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
                    </span>
                    <span className="text-[11px] text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-[11px] text-gray-400 capitalize">{task.status?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="px-5 py-6 text-center text-sm text-gray-400">All caught up!</p>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm" href="/activities">View All <ArrowUpRight size={13} /></Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {recentActivities.map((act: any, i: number) => {
              const icons: Record<string, string> = { call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅' };
              return (
                <div key={act.id || i} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                  <span className="mt-0.5 text-sm">{icons[act.type] || '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{act.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400 capitalize">{act.type}</span>
                      {act.activityDate && (
                        <>
                          <span className="text-[11px] text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-[11px] text-gray-400">{new Date(act.activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {act.isCompleted && (
                    <span className="flex-shrink-0 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/40 dark:text-emerald-400">Done</span>
                  )}
                </div>
              );
            })}
            {recentActivities.length === 0 && <p className="px-5 py-6 text-center text-sm text-gray-400">No activities yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
