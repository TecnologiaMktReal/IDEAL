"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "./lib/utils";
import { motion } from "framer-motion";

export type StageStepStatus = "not_started" | "in_progress" | "ready_for_completion" | "completed" | "reopened";

export interface StageStep {
  stage: string;
  label: string;
  status: StageStepStatus;
}

interface StageStepperProps {
  stages: StageStep[];
  onStageClick?: (stage: string) => void;
}

export function StageStepper({ stages, onStageClick }: StageStepperProps) {
  return (
    <nav aria-label="Pipeline Metodologico" className="w-full">
      <div className="flex items-center justify-between w-full relative">
        {/* Progress tracks */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-mkt-primary/5 -translate-y-1/2 z-0 rounded-full" />
        
        {stages.map((s, idx) => {
          const isCompleted = s.status === "completed";
          const isInProgress = s.status === "in_progress" || s.status === "ready_for_completion";
          const prevStage = idx > 0 ? stages[idx - 1] : null;
          const isNext = prevStage && prevStage.status === "completed" && s.status === "not_started";
          
          return (
            <div key={s.stage} className="relative z-10 flex flex-col items-center gap-4 group">
              <button
                onClick={() => onStageClick?.(s.stage)}
                disabled={!onStageClick}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shadow-sm relative overflow-hidden",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20" : 
                  isInProgress ? "bg-mkt-accent border-mkt-accent text-mkt-dark shadow-mkt-accent/20" : 
                  isNext ? "bg-white border-mkt-accent/40 text-mkt-accent/60" :
                  "bg-white border-mkt-primary/10 text-mkt-primary/20"
                )}
              >
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-none" />
                
                {isCompleted ? (
                   <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                     <Check size={24} strokeWidth={3} />
                   </motion.div>
                ) : isInProgress ? (
                   <div className="relative">
                      <span className="font-black text-xl italic">{s.stage}</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-mkt-dark rounded-full animate-ping" />
                   </div>
                ) : (
                   <span className="font-black text-xl italic">{s.stage}</span>
                )}
              </button>

              <div className="flex flex-col items-center">
                 <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300",
                    isInProgress ? "text-mkt-accent" : isCompleted ? "text-emerald-600" : "text-mkt-primary/30"
                 )}>
                    {s.label}
                 </span>
                 <div className={cn(
                    "h-1 mt-1 rounded-full transition-all duration-500",
                    isInProgress ? "w-4 bg-mkt-accent animate-pulse" : isCompleted ? "w-6 bg-emerald-500" : "w-0"
                 )} />
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

