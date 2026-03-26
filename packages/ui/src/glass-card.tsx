import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { cn } from "./lib/utils"; // We'll create this utility

interface GlassCardProps extends PropsWithChildren {
  className?: string;
  animate?: boolean;
}

export function GlassCard({ children, className, animate = true }: GlassCardProps) {
  const Component = animate ? motion.section : "section";
  
  return (
    <Component
      whileHover={animate ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6",
        "backdrop-blur-[18px] bg-[rgba(242,244,243,0.45)]",
        "border border-[rgba(133,131,108,0.18)] shadow-[0_8px_32px_0_rgba(34,34,32,0.1)]",
        "after:absolute after:inset-0 after:border after:border-white/30 after:rounded-[inherit] after:pointer-events-none",
        className
      )}
    >
      {children}
    </Component>
  );
}

