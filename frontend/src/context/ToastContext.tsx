import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: Toast = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, 'error', title), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let borderClass = 'border-surface-200';
          let icon = <Info className="w-5 h-5 text-surface-600 flex-shrink-0" />;

          if (toast.type === 'success') {
            borderClass = 'border-teal-500/30 bg-teal-50/90 text-teal-950';
            icon = <CheckCircle2 className="w-5 h-5 text-teal-700 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-rose-500/30 bg-rose-50/90 text-rose-950';
            icon = <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-500/30 bg-amber-50/90 text-amber-950';
            icon = <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />;
          } else {
            borderClass = 'border-surface-300 bg-white text-surface-900';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm min-w-0">
                {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
                <div className="leading-snug break-words">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-surface-400 hover:text-surface-700 transition-colors p-1 -mr-1 -mt-1 rounded"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
