'use client';

import { useEffect, useState } from 'react';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  roleName?: string;
}

export function useOrganization() {
  const [currentOrgId, setCurrentOrgIdState] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentOrgId');
      if (stored) {
        setCurrentOrgIdState(parseInt(stored, 10));
      }
    }
  }, []);

  const setCurrentOrgId = (orgId: number) => {
    setCurrentOrgIdState(orgId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentOrgId', orgId.toString());
    }
  };

  const clearCurrentOrgId = () => {
    setCurrentOrgIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentOrgId');
    }
  };

  return {
    currentOrgId,
    setCurrentOrgId,
    clearCurrentOrgId,
    organizations,
    setOrganizations,
  };
}
