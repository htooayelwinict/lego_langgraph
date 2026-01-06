import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Extend Window interface for toast API
declare global {
  interface Window {
    toast?: {
      show: (toast: Omit<Toast, 'id'>) => void;
    };
  }
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6',
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon" style={{ color: colors[toast.type] }}>
        {icons[toast.type]}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onClose(toast.id)}>
        <X size={14} />
      </button>
      <style>{`
        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border-left: 3px solid ${colors[toast.type]};
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          min-width: 300px;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .toast-icon {
          flex-shrink: 0;
        }
        .toast-message {
          flex: 1;
          font-size: 13px;
          color: #1e293b;
        }
        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
        }
        .toast-close:hover {
          color: #475569;
        }
      `}</style>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Expose addToast globally
  useEffect(() => {
    window.toast = { show: addToast };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}

// Convenience functions
export function showToast(message: string, type: ToastType = 'info') {
  window.toast?.show({ message, type });
}

export function showSuccess(message: string) {
  showToast(message, 'success');
}

export function showError(message: string) {
  showToast(message, 'error');
}
