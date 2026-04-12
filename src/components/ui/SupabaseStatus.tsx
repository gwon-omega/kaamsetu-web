/**
 * Supabase Connection Status Indicator
 * Shows a small pill in the bottom-right with live connection state.
 * Auto-hides after a delay.
 */
import { useState, useEffect } from "react";
import { isSupabaseReady, getSupabaseError } from "../../lib/supabase";

export default function SupabaseStatus() {
  const ready = isSupabaseReady();
  const status = ready ? "connected" : "disconnected";
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-hide: connected after 6s, disconnected after 10s
    const delay = ready ? 6000 : 10000;
    const timer = setTimeout(() => setVisible(false), delay);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!visible) return null;

  const error = getSupabaseError();

  return (
    <div
      className={`supabase-status ${status}`}
      title={status === "connected" ? "Supabase connected" : error || "Supabase not connected"}
      role="status"
      aria-live="polite"
    >
      <span className="supabase-status-dot" />
      <span>{status === "connected" ? "Connected" : "Offline Mode"}</span>
    </div>
  );
}
