interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {trend && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">{trend}</p>
                    )}
                </div>
                {icon && (
                    <div className="text-gray-400 dark:text-gray-600">{icon}</div>
                )}
            </div>
        </div>
    );
}
