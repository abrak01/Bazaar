import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  title,
  description,
  actionLabel,
  onAction,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card/40">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">{description}</p>
      {action ? (
        action
      ) : (
        actionLabel && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};
