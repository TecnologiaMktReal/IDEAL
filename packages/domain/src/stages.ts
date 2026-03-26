export const STAGE_SEQUENCE = ["I", "D", "E", "A", "L"] as const;

export type StageCode = (typeof STAGE_SEQUENCE)[number];

export const STAGE_NAMES: Record<StageCode, string> = {
  I: "Imersao",
  D: "Diagnostico",
  E: "Estrutura",
  A: "Arquitetura",
  L: "Loop"
};
