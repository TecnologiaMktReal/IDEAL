export type AiConfidence = "high" | "medium" | "low";

export interface EvidencePointer {
  sourceId: string;
  excerpt: string;
}

export interface AiSuggestion {
  suggestionId: string;
  domain: "transcription" | "diagnosis" | "premise" | "report";
  suggestedValue: string;
  confidence: AiConfidence;
  evidences: EvidencePointer[];
  state: "suggested" | "approved" | "edited" | "rejected";
}

export * from "./pipeline";
