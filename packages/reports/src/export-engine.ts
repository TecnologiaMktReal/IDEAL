import type { ExportRequest } from "./index";
import { REPORT_TEMPLATE_REGISTRY } from "./template-registry";

export interface ExportResult {
  storageKey: string;
  format: "pdf" | "docx";
  templateCode: string;
}

export function validateExportRequest(request: ExportRequest): void {
  const template = REPORT_TEMPLATE_REGISTRY.find((item) => item.templateCode === request.templateCode);
  if (!template) {
    throw new Error(`Template nao encontrado: ${request.templateCode}`);
  }
  if (template.stageCode !== request.stageCode) {
    throw new Error("Template nao pertence a etapa informada.");
  }
  if (!template.supportedFormats.includes(request.format)) {
    throw new Error("Formato nao suportado para o template.");
  }
}

export function buildStorageKey(request: ExportRequest): string {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  return `exports/${request.projectId}/${request.stageCode}/${request.templateCode}-${now}.${request.format}`;
}
