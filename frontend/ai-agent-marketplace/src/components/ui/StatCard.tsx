import React from 'react';
import { Card, CardContent } from './Card';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  className,
}) => {
  return (
    <Card className={clsx('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-2xl text-primary">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <h4 className="text-3xl font-extrabold tracking-tight text-foreground">{value}</h4>
          {change && (
            <span
              className={clsx(
                'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              )}
            >
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
