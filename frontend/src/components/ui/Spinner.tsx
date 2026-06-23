import { cn } from "../../lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-5 rounded-full border-2 border-slate-200 border-t-accent-600 animate-spin",
        className,
      )}
    />
  );
}
