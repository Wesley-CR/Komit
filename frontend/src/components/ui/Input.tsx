import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        "transition-colors",
        error
          ? "border-red-400 bg-red-50 focus-visible:ring-red-400"
          : "border-slate-200 bg-white hover:border-slate-300",
        className,
      )}
      {...rest}
    />
  );
}
