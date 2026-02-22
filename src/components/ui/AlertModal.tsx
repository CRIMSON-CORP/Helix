import { AlertTriangle } from "lucide-react";
import { Button } from "../common/Button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: AlertModalProps) {
  if (!isOpen) return null;

  const variantColors = {
    danger: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-600 hover:text-white",
    warning:
      "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-600 hover:text-white",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-600 hover:text-white",
  }[variant];

  const buttonColors = {
    danger: "bg-rose-600 hover:bg-rose-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    info: "bg-blue-600 hover:bg-blue-700",
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-md rounded-3xl bg-[#1a1a1f] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${variantColors.split(" ").slice(0, 3).join(" ")}`}
          >
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">{description}</p>

          <div className="flex w-full gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-12 rounded-xl text-white border-0 transition-all ${buttonColors} shadow-lg shadow-rose-500/10`}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
