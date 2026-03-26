import type { AiSuggestion, EvidencePointer } from "./index";
import { randomUUID } from "node:crypto";

export interface TranscriptionInterpretInput {
  transcriptId: string;
  stageCode: "I" | "D" | "E" | "A" | "L";
  stakeholderProfile: string;
}

export interface GeneratedSuggestion extends AiSuggestion {
  transcriptId: string;
  generatedAt: string;
}

export function buildSuggestion(
  input: TranscriptionInterpretInput,
  value: string,
  confidence: AiSuggestion["confidence"],
  evidences: EvidencePointer[]
): GeneratedSuggestion {
  if (evidences.length === 0) {
    throw new Error("Sugestao sem evidencia nao pode ser criada.");
  }

  return {
    suggestionId: randomUUID(),
    domain: "transcription",
    confidence,
    evidences,
    state: "suggested",
    suggestedValue: value,
    transcriptId: input.transcriptId,
    generatedAt: new Date().toISOString()
  };
}
