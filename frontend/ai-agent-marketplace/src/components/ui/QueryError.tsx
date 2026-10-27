import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Error state shown when an on-chain read fails. Mirrors the look of
 * `EmptyState` but with an alert icon and a retry action.
 */
export const QueryError: React.FC<QueryErrorProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card/40">
    <AlertCircle className="h-10 w-10 text-destructive mb-4" />
    <h3 className="text-xl font-bold text-foreground">Couldn't load data</h3>
    <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
      {message || 'Something went wrong while fetching on-chain data.'}
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    )}
  </div>
);
