'use client';

interface DetailsProps {
    data: Record<string, any>;
    labels?: Record<string, string>;
}

export function Details({ data, labels }: DetailsProps) {
    return (
        <div className="grid grid-cols-2 gap-6">
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {labels?.[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                        {value ? String(value) : '-'}
                    </p>
                </div>
            ))}
        </div>
    );
}
