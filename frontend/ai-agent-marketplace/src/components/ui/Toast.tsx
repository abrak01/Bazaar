import React, { useEffect } from 'react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200',
    error: 'border-rose-500/50 bg-rose-950/40 text-rose-200',
    info: 'border-blue-500/50 bg-blue-950/40 text-blue-200',
    warning: 'border-amber-500/50 bg-amber-950/40 text-amber-200',
  };

  return (
    <div
      className={clsx(
        'flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300',
        borders[type]
      )}
    >
      <span className="text-xl">{icons[type]}</span>
      <div className="flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-xs opacity-60 hover:opacity-100 transition-opacity p-1"
      >
        ✕
      </button>
    </div>
  );
};
