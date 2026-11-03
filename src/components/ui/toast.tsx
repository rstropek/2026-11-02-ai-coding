"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

// Transient success messages, bottom right, with an optional undo. Never for
// errors: those stay on the page as an Alert.

type Toast = { id: number; message: string; undo?: () => void };
type ShowToast = (message: string, undo?: () => void) => void;

const ToastContext = createContext<ShowToast>(() => {});

const HIDE_AFTER_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (message, undo) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, undo }]);
      setTimeout(() => dismiss(id), HIDE_AFTER_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-md items-center gap-4 rounded-control bg-ink px-4 py-3 text-sm text-white shadow-overlay motion-safe:animate-appear"
          >
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                className="font-medium underline underline-offset-2"
                onClick={() => {
                  dismiss(toast.id);
                  toast.undo?.();
                }}
              >
                Rückgängig
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

/** Returns a function that shows a toast: toast("Gespeichert.", undo?). */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}
