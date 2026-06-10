"use client";

interface ToastProps {
  type: "error" | "warning";
  message: string;
}

export function Toast({ type, message }: ToastProps) {
  const isError = type === "error";
  return (
    <div
      role="alert"
      className={[
        "flex max-w-xs items-start gap-2.5 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
        isError
          ? "border border-red-700/20 bg-red-600 text-white"
          : "border border-amber-400 bg-amber-50 text-amber-900",
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0 text-base font-bold leading-none">
        {isError ? "✕" : "⚠"}
      </span>
      <span className="leading-snug">{message}</span>
    </div>
  );
}
