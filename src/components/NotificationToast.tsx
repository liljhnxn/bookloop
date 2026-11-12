"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, X, ExternalLink } from "lucide-react";
import { EXPLORER_URL } from "@/config/contract";

export interface ToastMessage {
  id: string;
  type: "pending" | "success" | "error";
  title: string;
  message?: string;
  txHash?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all animate-slide-up ${
            toast.type === "success"
              ? "bg-white/95 border-emerald-300 text-[#2C1810]"
              : toast.type === "error"
              ? "bg-white/95 border-rose-300 text-[#2C1810]"
              : "bg-white/95 border-[#D3BFAB] text-[#2C1810]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {toast.type === "pending" && (
                <div className="w-7 h-7 rounded-full bg-[#EFE6DD] flex items-center justify-center text-[#C85A17]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#2C1810]">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#6B5549] mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.txHash && (
                <a
                  href={`${EXPLORER_URL}/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-[#C85A17] hover:underline font-mono mt-1.5"
                >
                  <span>View on BotchainScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8C7567] hover:text-[#2C1810] p-1 rounded-lg hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

