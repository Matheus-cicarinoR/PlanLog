import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center min-h-[300px] border border-dashed border-slate-300 bg-slate-50 rounded-2xl w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 ">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 ">{title}</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
        </div>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
