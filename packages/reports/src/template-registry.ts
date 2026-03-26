export interface ReportTemplate {
  templateCode: string;
  stageCode: "I" | "D" | "E" | "A" | "L";
  audience: "internal" | "client";
  supportedFormats: ("pdf" | "docx")[];
}

export const REPORT_TEMPLATE_REGISTRY: ReportTemplate[] = [
  { templateCode: "I_REL_CLIENTE", stageCode: "I", audience: "client", supportedFormats: ["pdf", "docx"] },
  { templateCode: "D_REL_CLIENTE", stageCode: "D", audience: "client", supportedFormats: ["pdf", "docx"] },
  { templateCode: "E_REL_CLIENTE", stageCode: "E", audience: "client", supportedFormats: ["pdf", "docx"] },
  { templateCode: "A_REL_CLIENTE", stageCode: "A", audience: "client", supportedFormats: ["pdf", "docx"] },
  { templateCode: "L_REL_CLIENTE", stageCode: "L", audience: "client", supportedFormats: ["pdf", "docx"] },
  { templateCode: "I_DOSSIE_INTERNO", stageCode: "I", audience: "internal", supportedFormats: ["pdf", "docx"] },
  { templateCode: "D_FORM_INTERNO", stageCode: "D", audience: "internal", supportedFormats: ["pdf", "docx"] },
  { templateCode: "E_FORM_INTERNO", stageCode: "E", audience: "internal", supportedFormats: ["pdf", "docx"] },
  { templateCode: "A_FORM_INTERNO", stageCode: "A", audience: "internal", supportedFormats: ["pdf", "docx"] },
  { templateCode: "L_FORM_INTERNO", stageCode: "L", audience: "internal", supportedFormats: ["pdf", "docx"] }
];
