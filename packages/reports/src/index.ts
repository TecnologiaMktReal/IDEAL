export type ExportFormat = "pdf" | "docx";

export interface ExportRequest {
  projectId: string;
  stageCode: "I" | "D" | "E" | "A" | "L";
  templateCode: string;
  format: ExportFormat;
}

export * from "./export-engine";
export * from "./template-registry";
