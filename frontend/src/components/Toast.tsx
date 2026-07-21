"use client";

import { useEffect } from "react";
import { useUi } from "@/store/ui";

/** Bottom-center toast, 4s auto-dismiss. */
export function Toast() {
  const toast = useUi((s) => s.toast);
  const clearToast = useUi((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="max-w-sm rounded-full bg-slate-900 px-4 py-2 text-center text-sm text-white shadow-lg">
        {toast}
      </div>
    </div>
  );
}
