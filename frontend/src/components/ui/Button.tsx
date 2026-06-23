import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800",
    ghost:   "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
