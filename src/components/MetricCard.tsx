import React from 'react';
import { Card, CardContent } from './ui/card';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconColorClass?: string;
    className?: string;
    subtext?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function MetricCard({ title, value, icon, iconColorClass, className, subtext, trend }: MetricCardProps) {
    return (
        <Card className={className}>
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <div className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0 ${iconColorClass || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
                        {trend && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                    {subtext && <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtext}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
