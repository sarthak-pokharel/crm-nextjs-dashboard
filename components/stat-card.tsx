interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendDown?: boolean;
    subtitle?: string;
}

export function StatCard({ label, value, icon, trend, trendDown, subtitle }: StatCardProps) {
    return (
        <div className="group relative rounded-xl border border-gray-200/80 bg-white p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300/80 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
                    {trend && (
                        <p className={`flex items-center gap-1 text-xs font-medium ${trendDown ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            <span>{trendDown ? '↓' : '↑'}</span>
                            {trend}
                        </p>
                    )}
                    {subtitle && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
