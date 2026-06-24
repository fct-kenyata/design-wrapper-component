import React, { createContext, useContext, useCallback } from "react";
import { toast as sonnerToast } from "sonner";
import { Toaster } from "../ui/sonner";

/**
 * Toast — public API preserved (ToastProvider + useToast), now backed by sonner.
 *
 *   const toast = useToast();
 *   toast({ message, title?, type?: "info"|"success"|"warning"|"error", duration? });
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useCallback(
    ({ message, title, type = "info", duration = 3000 }) => {
      const fn =
        type === "success"
          ? sonnerToast.success
          : type === "error"
            ? sonnerToast.error
            : type === "warning"
              ? sonnerToast.warning
              : sonnerToast.info;
      // With a title, show it as the heading and the message as the description;
      // otherwise the message is the heading.
      return fn(title ?? message, {
        description: title ? message : undefined,
        duration,
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
