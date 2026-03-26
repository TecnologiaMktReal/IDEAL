import type { StageCode } from "@ideal/domain/stages";
import { STAGE_SEQUENCE } from "@ideal/domain/stages";

export type StageStatus =
  | "not_started"
  | "in_progress"
  | "ready_for_completion"
  | "completed"
  | "reopened";

export interface StageGateState {
  stage: StageCode;
  status: StageStatus;
  automaticChecklistOk: boolean;
  manualConsultantConfirmationOk: boolean;
  requiredClientDecisionOk: boolean;
}

export function canMoveToCompleted(input: StageGateState): boolean {
  return (
    input.status === "ready_for_completion" &&
    input.automaticChecklistOk &&
    input.manualConsultantConfirmationOk &&
    input.requiredClientDecisionOk
  );
}

export function nextStage(current: StageCode): StageCode | null {
  const index = STAGE_SEQUENCE.indexOf(current);
  const value = STAGE_SEQUENCE[index + 1];
  return value ?? null;
}

export function canReopenFromLoop(target: StageCode): boolean {
  return target === "D" || target === "A" || target === "I";
}
