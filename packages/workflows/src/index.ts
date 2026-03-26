export interface StageCompletionGate {
  automaticChecklistOk: boolean;
  manualConsultantConfirmationOk: boolean;
  requiredClientDecisionOk: boolean;
}

export function canCompleteStage(gate: StageCompletionGate): boolean {
  return (
    gate.automaticChecklistOk &&
    gate.manualConsultantConfirmationOk &&
    gate.requiredClientDecisionOk
  );
}

export * from "./stage-machine";
