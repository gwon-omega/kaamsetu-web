import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  titleId?: string;
}

function focusFirstFocusable(container: HTMLElement) {
  const el = container.querySelector<HTMLElement>(
    [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(","),
  );
  (el ?? container).focus();
}

export default function Modal({ open, onClose, children, titleId }: ModalProps) {
  const fallbackTitleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    // Focus after paint so the dialog is in DOM.
    const t = window.setTimeout(() => {
      if (dialogRef.current) focusFirstFocusable(dialogRef.current);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId ?? fallbackTitleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
