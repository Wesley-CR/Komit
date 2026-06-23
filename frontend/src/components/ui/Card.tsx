import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
