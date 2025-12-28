'use client';

import { Header } from '@/components/header';
import { Settings as SettingsIcon, Database, Shield, Bell, Palette } from 'lucide-react';

const settingsSections = [
  {
    title: 'System Configuration',
    description: 'General system settings and preferences',
    icon: SettingsIcon,
    items: [
      { name: 'Application Name', value: 'CRM System' },
      { name: 'Default Timezone', value: 'UTC' },
      { name: 'Date Format', value: 'MM/DD/YYYY' },
    ],
  },
  {
    title: 'Security',
    description: 'Security and authentication settings',
    icon: Shield,
    items: [
      { name: 'Password Policy', value: 'Strong (8+ chars, mixed case, numbers)' },
      { name: 'Session Timeout', value: '1 hour' },
      { name: 'Two-Factor Auth', value: 'Disabled' },
    ],
  },
  {
    title: 'Database',
    description: 'Database connection and backup settings',
    icon: Database,
    items: [
      { name: 'Database Type', value: 'PostgreSQL' },
      { name: 'Connection Pool', value: 'Active' },
      { name: 'Auto Backup', value: 'Daily at 2:00 AM' },
    ],
  },
  {
    title: 'Notifications',
    description: 'Email and notification preferences',
    icon: Bell,
    items: [
      { name: 'Email Notifications', value: 'Enabled' },
      { name: 'SMTP Server', value: 'Configured' },
      { name: 'Notification Digest', value: 'Daily' },
    ],
  },
  {
    title: 'Appearance',
    description: 'UI customization and branding',
    icon: Palette,
    items: [
      { name: 'Theme', value: 'Light' },
      { name: 'Primary Color', value: 'Blue' },
      { name: 'Logo', value: 'Default' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="System Settings"
        description="Configure system preferences and options"
      />

      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Note:</strong> Settings management is currently read-only. 
          To modify system settings, update the environment variables and configuration files.
        </p>
      </div>
    </div>
  );
}
