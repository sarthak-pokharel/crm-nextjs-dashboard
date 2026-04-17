'use client';

import { ReactNode } from 'react';

interface DetailsProps {
    data: Record<string, any>;
    labels?: Record<string, string>;
    renders?: Record<string, (value: any) => ReactNode>;
}

export function Details({ data, labels, renders }: DetailsProps) {
    const formatLabel = (key: string) => {
        if (labels?.[key]) return labels[key];
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, s => s.toUpperCase())
            .trim();
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="group">
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        {formatLabel(key)}
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                        {renders?.[key] ? renders[key](value) : (value != null && value !== '' ? String(value) : <span className="text-gray-300 dark:text-gray-600">—</span>)}
                    </dd>
                </div>
            ))}
        </div>
    );
}
