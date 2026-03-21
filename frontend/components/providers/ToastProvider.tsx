"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
  tone?: "default" | "error";
};

type ToastContextType = {
  showToast: (message: string, tone?: ToastItem["tone"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextToastId = useRef(0);

  const value = useMemo(
    () => ({
      showToast(message: string, tone: ToastItem["tone"] = "default") {
        const id = ++nextToastId.current;
        setToasts((current) => [...current, { id, message, tone }]);

        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 2600);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-in rounded-2xl border px-4 py-3 text-sm shadow-2xl ${
              toast.tone === "error"
                ? "border-red-400/20 bg-red-950/85 text-red-100"
                : "border-yellow-300/20 bg-neutral-900/92 text-yellow-50"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
