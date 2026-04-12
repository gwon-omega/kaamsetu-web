import { useState, useEffect } from "react";

interface ToastData { msg: string; type: "success" | "error"; }

let toastSetter: ((t: ToastData | null) => void) | null = null;

export function showToast(msg: string, type: "success" | "error" = "success") {
  toastSetter?.({ msg, type });
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    toastSetter = setToast;
    return () => { toastSetter = null; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`toast toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {toast.type === "error" ? "⚠ " : "✓ "}{toast.msg}
    </div>
  );
}
