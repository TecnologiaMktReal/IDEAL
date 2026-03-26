import { MethodologyArtifactDefinition } from "./catalog";

type ValidationIssue = {
  code: string;
  level: "error" | "warning";
  message: string;
};

export type ArtifactValidationResult = {
  ok: boolean;
  missingRequired: string[];
  issues: ValidationIssue[];
  computed: Record<string, unknown>;
};

function isFilledValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return true;
  return false;
}

function validateRequiredFields(artifact: MethodologyArtifactDefinition, answers: Record<string, unknown>) {
  const missingRequired: string[] = [];
  for (const section of artifact.sections) {
    for (const field of section.fields) {
      if (!field.required) continue;
      if (!isFilledValue(answers[field.code])) {
        missingRequired.push(`${section.title} > ${field.label}`);
      }
    }
  }
  return missingRequired;
}

function parseScoreObject(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const scoreObj = value as Record<string, unknown>;
  const parsed: Record<string, number> = {};
  for (const [key, raw] of Object.entries(scoreObj)) {
    if (typeof raw !== "number") return null;
    parsed[key] = raw;
  }
  return parsed;
}

function classifyCamada1(points: number) {
  if (points <= 25) return "Reativo";
  if (points <= 41) return "Operacional";
  if (points <= 53) return "Estruturado";
  return "Estrategico";
}

function validateCamada1(answers: Record<string, unknown>): ArtifactValidationResult {
  const issues: ValidationIssue[] = [];
  const missingRequired: string[] = [];
  
  const scoreObj: Record<string, number> = {};
  for(let i=1; i<=10; i++) {
    const val = Number(answers[`block${i}`]);
    if (!Number.isNaN(val) && val !== 0) {
       scoreObj[`block${i}`] = val;
    }
  }

  const weights: Record<string, number> = {
    block1: 2,
    block2: 1,
    block3: 2,
    block4: 2,
    block5: 2,
    block6: 1,
    block7: 1,
    block8: 2,
    block9: 1,
    block10: 2
  };

  const requiredBlocks = Object.keys(weights);
  const missingBlocks = requiredBlocks.filter((block) => typeof scoreObj[block] !== "number");
  if (missingBlocks.length > 0) {
    missingRequired.push(`Blocos ausentes: ${missingBlocks.join(", ")}`);
  }

  const invalidRange = requiredBlocks.filter((block) => {
    const value = scoreObj[block];
    return typeof value !== "number" || value < 1 || value > 4;
  });
  if (invalidRange.length > 0) {
    missingRequired.push(`Notas fora da escala 1..4: ${invalidRange.join(", ")}`);
  }

  if (missingRequired.length > 0) {
    return { ok: false, missingRequired, issues, computed: {} };
  }

  const totalPoints = requiredBlocks.reduce((sum, block) => sum + (scoreObj[block] ?? 0) * (weights[block] ?? 1), 0);
  let classification = classifyCamada1(totalPoints);
  const blocks = requiredBlocks.map((block) => scoreObj[block] ?? 0);
  const structural = [scoreObj.block1 ?? 0, scoreObj.block3 ?? 0, scoreObj.block4 ?? 0, scoreObj.block10 ?? 0];
  const hasAllEssentialAssets = Boolean(answers.has_all_essential_assets);
  const hasMarca = Boolean(answers.has_registro_marca_concedido);
  const hasGovernanca = Boolean(answers.has_governanca_ativos_formal);

  const canBeEstruturado =
    blocks.every((note) => note >= 2) && structural.every((note) => note >= 3) && hasAllEssentialAssets;
  const canBeEstrategico =
    blocks.every((note) => note >= 3) &&
    structural.every((note) => note >= 4) &&
    blocks.filter((note) => note === 3).length <= 2 &&
    hasMarca &&
    hasGovernanca;

  if (classification === "Estrategico" && !canBeEstrategico) {
    classification = "Estruturado";
    issues.push({
      code: "c1_downgrade_estrategico",
      level: "warning",
      message: "Classificacao rebaixada para Estruturado por criterios obrigatorios nao atendidos."
    });
  }

  if (classification === "Estruturado" && !canBeEstruturado) {
    classification = "Operacional";
    issues.push({
      code: "c1_downgrade_estruturado",
      level: "warning",
      message: "Classificacao rebaixada para Operacional por criterios obrigatorios nao atendidos."
    });
  }

  return {
    ok: true,
    missingRequired: [],
    issues,
    computed: {
      weightedPoints: totalPoints,
      maxPoints: 64,
      classification,
      canBeEstruturado,
      canBeEstrategico
    }
  };
}

function classifyCamada2(points: number) {
  if (points <= 49) return "Critico";
  if (points <= 70) return "Fragil";
  if (points <= 91) return "Solido";
  return "Superior";
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function validateCamada2(answers: Record<string, unknown>): ArtifactValidationResult {
  const issues: ValidationIssue[] = [];
  const missingRequired: string[] = [];

  const axisBlocks: Record<string, string[]> = {
    e1: ["e1b1", "e1b2", "e1b3", "e1b4", "e1b5", "e1b6"],
    e2: ["e2b1", "e2b2", "e2b3"],
    e3: ["e3b1", "e3b2", "e3b3", "e3b4"],
    e4: ["e4b1", "e4b2", "e4b3"],
    e5: ["e5b1"],
    e6: ["e6b1", "e6b2", "e6b3", "e6b4"],
    e7: ["e7b1", "e7b2", "e7b3", "e7b4"],
    e8: ["e8b1", "e8b2", "e8b3"]
  };
  const expectedBlocks = Object.values(axisBlocks).flat();

  const scoreObj: Record<string, number> = {};
  for(const block of expectedBlocks) {
    const val = Number(answers[block]);
    if (!Number.isNaN(val) && val !== 0) {
      scoreObj[block] = val;
    }
  }

  // expectedBlocks already defined above
  const missingBlocks = expectedBlocks.filter((block) => typeof scoreObj[block] !== "number");
  if (missingBlocks.length > 0) {
    missingRequired.push(`Blocos ausentes: ${missingBlocks.join(", ")}`);
  }

  const invalidRange = expectedBlocks.filter((block) => {
    const value = scoreObj[block];
    return typeof value !== "number" || value < 1 || value > 4;
  });
  if (invalidRange.length > 0) {
    missingRequired.push(`Notas fora da escala 1..4: ${invalidRange.join(", ")}`);
  }

  if (missingRequired.length > 0) {
    return { ok: false, missingRequired, issues, computed: {} };
  }

  const outboundStrategic = Boolean(answers.outbound_is_strategic);
  if (!outboundStrategic) {
    scoreObj.e8b3 = Math.max(scoreObj.e8b3 ?? 2, 2);
    issues.push({
      code: "c2_outbound_na",
      level: "warning",
      message: "Outbound marcado como nao estrategico: bloco E8B3 foi tratado sem penalizacao maxima."
    });
  }

  const totalPoints = expectedBlocks.reduce((sum, block) => sum + (scoreObj[block] ?? 0), 0);
  let classification = classifyCamada2(totalPoints);
  const criticalCount = expectedBlocks.filter((block) => (scoreObj[block] ?? 0) === 1).length;
  const fragileCount = expectedBlocks.filter((block) => (scoreObj[block] ?? 0) === 2).length;

  const axisAverages: Record<string, number> = {};
  for (const [axis, blocks] of Object.entries(axisBlocks)) {
    axisAverages[axis] = average(blocks.map((block) => scoreObj[block] ?? 0));
  }

  const hasAxisAllCritical = Object.values(axisBlocks).some((blocks) =>
    blocks.every((block) => (scoreObj[block] ?? 0) === 1)
  );
  if (criticalCount >= 8) classification = "Critico";
  if (criticalCount >= 5 && classification !== "Critico") classification = "Fragil";
  if (hasAxisAllCritical) classification = "Fragil";
  if (((axisAverages.e1 ?? 0) < 2 || (axisAverages.e8 ?? 0) < 2) && classification !== "Critico") classification = "Fragil";
  if (classification === "Superior" && (criticalCount > 0 || fragileCount > 3)) classification = "Solido";

  return {
    ok: true,
    missingRequired: [],
    issues,
    computed: {
      totalPoints,
      maxPoints: 112,
      classification,
      criticalCount,
      fragileCount,
      axisAverages
    }
  };
}

export function validateArtifactAnswers(
  artifact: MethodologyArtifactDefinition,
  answers: Record<string, unknown>
): ArtifactValidationResult {
  const missingRequired = validateRequiredFields(artifact, answers);
  const issues: ValidationIssue[] = [];
  if (missingRequired.length > 0) {
    return { ok: false, missingRequired, issues, computed: {} };
  }

  if (artifact.code === "FORMULARIO_CONSOLIDADO_CAMADA1") {
    return validateCamada1(answers);
  }
  if (artifact.code === "FORMULARIO_CONSOLIDADO_CAMADA2") {
    return validateCamada2(answers);
  }

  return {
    ok: true,
    missingRequired: [],
    issues,
    computed: {}
  };
}
