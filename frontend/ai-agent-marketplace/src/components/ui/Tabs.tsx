import * as React from 'react';
import { clsx } from 'clsx';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => (
  <div className={clsx('space-y-4', className)}>
    {React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, { value, onValueChange });
    })}
  </div>
);

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => (
  <div className={clsx('flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      data-value={value}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      onClick={() => props.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const TabsContent = ({ value, children, className, forceMount }: TabsContentProps) => (
  <div
    data-value={value}
    className={clsx(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    hidden={!forceMount && false}
  >
    {children}
  </div>
);

export default { Tabs, TabsList, TabsTrigger, TabsContent };