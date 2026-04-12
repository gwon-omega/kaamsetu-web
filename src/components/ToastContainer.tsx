/**
 * Toast Notification Component
 * Displays in-app toast notifications (not push notifications)
 * Auto-dismisses after duration
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useUIStore } from "../store";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    // Auto-dismiss toasts after their duration
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose: () => void;
}

function Toast({ type, title, message, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-orange-50 border-orange-200 text-orange-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-orange-600",
    info: "text-blue-600",
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`${colors[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3`}
    >
      <Icon className={`w-5 h-5 ${iconColors[type]} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Helper hook for easy toast usage
export function useToast() {
  const { addToast } = useUIStore();

  return {
    success: (title: string, message: string, duration?: number) =>
      addToast({ type: "success", title, message, duration }),
    error: (title: string, message: string, duration?: number) =>
      addToast({ type: "error", title, message, duration }),
    warning: (title: string, message: string, duration?: number) =>
      addToast({ type: "warning", title, message, duration }),
    info: (title: string, message: string, duration?: number) =>
      addToast({ type: "info", title, message, duration }),
  };
}
