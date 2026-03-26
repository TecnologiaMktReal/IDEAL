import { PropsWithChildren } from "react";
import { cn } from "./lib/utils";

interface GlassTopbarProps extends PropsWithChildren {
  className?: string;
}

export function GlassTopbar({ children, className }: GlassTopbarProps) {
  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full h-20 px-8 flex items-center justify-between",
        "backdrop-blur-xl bg-white/40 border-b border-mkt-primary/10 shadow-sm",
        className
      )}
    >
      {children}
    </header>
  );
}
