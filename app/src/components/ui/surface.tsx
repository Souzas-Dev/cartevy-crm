import type { ReactNode } from "react";

type SurfaceProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function Surface({
  children,
  className = "",
}: SurfaceProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}
