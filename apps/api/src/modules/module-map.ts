export interface ModuleDefinition {
  code: string;
  kind: "stage" | "transversal";
  description: string;
}

export const MODULE_MAP: ModuleDefinition[] = [
  { code: "M1", kind: "transversal", description: "Gestao de Projetos" },
  { code: "M2", kind: "stage", description: "Imersao" },
  { code: "M3", kind: "stage", description: "Diagnostico" },
  { code: "M4", kind: "stage", description: "Estrutura" },
  { code: "M5", kind: "stage", description: "Arquitetura do Planejamento" },
  { code: "M6", kind: "stage", description: "Loop de Otimizacoes" },
  { code: "M7", kind: "transversal", description: "Motor de IA" },
  { code: "M8", kind: "transversal", description: "Portal do Cliente" },
  { code: "M9", kind: "transversal", description: "Painel do Gestor" },
  { code: "M10", kind: "transversal", description: "Administracao" }
];
