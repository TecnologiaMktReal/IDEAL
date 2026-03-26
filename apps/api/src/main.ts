import Fastify from "fastify";
import cors from "@fastify/cors";
import { config as loadEnv } from "dotenv";
import { STAGE_SEQUENCE } from "@ideal/domain/stages";
import { MODULE_MAP } from "./modules/module-map";
import { createSupabaseAdminClient } from "./lib/supabase-admin";
import {
  MethodologyArtifactDefinition,
  MethodologyStageCode,
  getArtifactByCode,
  getArtifactsByStage,
  methodologyArtifacts,
  methodologyStages
} from "./modules/methodology/catalog";
import { validateArtifactAnswers } from "./modules/methodology/rules";

loadEnv({ path: ".env" });
loadEnv({ path: "apps/api/.env" });

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

function toUserMessage(errorMessage: string) {
  if (errorMessage.includes("Could not find the table")) {
    return "Estrutura do banco nao criada ainda. Execute schema.sql e supabase-bootstrap.sql no projeto Supabase.";
  }
  return errorMessage;
}

async function getAuditActorUserId() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", "tecnologia@mktreal.com.br")
    .limit(1)
    .maybeSingle();
  if (data?.id) return data.id;

  const { data: firstUser } = await supabase.from("users").select("id").limit(1).maybeSingle();
  return firstUser?.id ?? null;
}

async function writeAudit(projectId: string | null, actionCode: string, payload: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const actorUserId = await getAuditActorUserId();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    project_id: projectId,
    action_code: actionCode,
    payload
  });
  if (error) {
    return { ok: false as const, message: toUserMessage(error.message) };
  }
  return { ok: true as const };
}

function normalizeStage(stageCode: string): MethodologyStageCode | null {
  if (stageCode === "I" || stageCode === "D" || stageCode === "E" || stageCode === "A" || stageCode === "L") {
    return stageCode;
  }
  return null;
}

function parseJsonRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function toFlatAnswers(rows: Array<{ field_code: string; value_json: unknown }>) {
  const answerMap: Record<string, unknown> = {};
  rows.forEach((row) => {
    answerMap[row.field_code] = row.value_json;
  });
  return answerMap;
}

function computeCompletion(artifact: MethodologyArtifactDefinition, answers: Record<string, unknown>) {
  let totalFields = 0;
  let filledFields = 0;
  const sectionStats = artifact.sections.map((section) => {
    const sectionTotal = section.fields.length;
    const sectionFilled = section.fields.filter((field) => {
      const value = answers[field.code];
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }).length;
    totalFields += sectionTotal;
    filledFields += sectionFilled;
    return {
      sectionCode: section.code,
      sectionTitle: section.title,
      completionRatio: sectionTotal === 0 ? 0 : Math.round((sectionFilled / sectionTotal) * 10000) / 100,
      status: sectionFilled === sectionTotal ? "completed" : sectionFilled > 0 ? "in_progress" : "pending"
    };
  });

  return {
    artifactCompletionRatio: totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 10000) / 100,
    sectionStats
  };
}

async function ensureArtifactState(projectId: string, stage: MethodologyStageCode, artifact: MethodologyArtifactDefinition) {
  const supabase = createSupabaseAdminClient();
  const { data: current, error } = await supabase
    .from("project_stage_artifacts")
    .select("id, status, completion_ratio, computed_json, validated_at, completed_at, updated_at")
    .eq("project_id", projectId)
    .eq("stage", stage)
    .eq("artifact_code", artifact.code)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (current?.id) {
    return current;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("project_stage_artifacts")
    .insert({
      project_id: projectId,
      stage,
      artifact_code: artifact.code,
      artifact_name: artifact.name,
      status: "draft"
    })
    .select("id, status, completion_ratio, computed_json, validated_at, completed_at, updated_at")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Falha ao inicializar artefato da etapa.");
  }
  return inserted;
}

async function loadArtifactAnswers(artifactId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("project_artifact_answers")
    .select("section_code, field_code, value_json")
    .eq("artifact_id", artifactId);
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

async function upsertSectionStats(artifactId: string, sectionStats: Array<{ sectionCode: string; sectionTitle: string; status: string; completionRatio: number }>) {
  const supabase = createSupabaseAdminClient();
  const payload = sectionStats.map((section) => ({
    artifact_id: artifactId,
    section_code: section.sectionCode,
    section_title: section.sectionTitle,
    status: section.status,
    completion_ratio: section.completionRatio
  }));
  if (payload.length === 0) return;

  const { error } = await supabase
    .from("project_artifact_sections")
    .upsert(payload, { onConflict: "artifact_id,section_code" });
  if (error) {
    throw new Error(error.message);
  }
}

app.get("/health", async () => ({ ok: true }));

app.get("/metadata/stages", async () => ({
  sequence: STAGE_SEQUENCE
}));

app.get("/metadata/modules", async () => ({
  modules: MODULE_MAP
}));

app.get("/methodology/catalog", async () => {
  return {
    ok: true,
    stages: methodologyStages,
    artifacts: methodologyArtifacts
  };
});

app.get("/supabase/health", async () => {
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasUrl || !hasServiceRole) {
    return { ok: false, hasUrl, hasServiceRole };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

  return {
    ok: !error,
    hasUrl,
    hasServiceRole,
    authAdminReachable: !error,
    error: error?.message ?? null
  };
});

app.get<{
  Querystring: {
    q?: string;
    page?: string;
    pageSize?: string;
  };
}>("/m1/projects", async (request, reply) => {
  const { q = "", page = "1", pageSize = "10" } = request.query;
  const currentPage = Number.parseInt(page, 10) > 0 ? Number.parseInt(page, 10) : 1;
  const currentPageSize = Number.parseInt(pageSize, 10) > 0 ? Number.parseInt(pageSize, 10) : 10;
  const from = (currentPage - 1) * currentPageSize;
  const to = from + currentPageSize - 1;

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("projects")
    .select("id, client_company_name, cnpj, segment, started_at, expected_end_at, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q.trim()) {
    const safe = q.trim().replace(/,/g, " ");
    query = query.or(`client_company_name.ilike.%${safe}%,cnpj.ilike.%${safe}%,segment.ilike.%${safe}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage(error.message) });
  }

  return {
    ok: true,
    projects: data ?? [],
    pagination: {
      page: currentPage,
      pageSize: currentPageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / currentPageSize))
    }
  };
});

app.get<{
  Params: { projectId: string };
}>("/m1/projects/:projectId", async (request, reply) => {
  const { projectId } = request.params;
  const supabase = createSupabaseAdminClient();

  const [{ data: projectData, error: projectError }, { data: stageData, error: stageError }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, client_company_name, cnpj, segment, started_at, expected_end_at, created_at")
      .eq("id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("project_stage_state")
      .select(
        "id, stage, status, automatic_checklist_ok, manual_confirmation_ok, required_client_decision_ok, completed_at"
      )
      .eq("project_id", projectId)
      .order("stage", { ascending: true })
  ]);

  if (projectError) {
    return reply.status(500).send({ ok: false, message: toUserMessage(projectError.message) });
  }
  if (!projectData) {
    return reply.status(404).send({ ok: false, message: "Projeto nao encontrado." });
  }
  if (stageError) {
    return reply.status(500).send({ ok: false, message: toUserMessage(stageError.message) });
  }

  return {
    ok: true,
    project: projectData,
    stages: stageData ?? []
  };
});

app.get<{
  Params: { projectId: string };
}>("/m1/projects/:projectId/audit", async (request, reply) => {
  const { projectId } = request.params;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action_code, payload, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return {
        ok: true,
        auditEntries: [],
        unavailable: true,
        message: "Tabela de auditoria indisponivel no schema cache."
      };
    }
    return reply.status(500).send({ ok: false, message: toUserMessage(error.message) });
  }

  return {
    ok: true,
    auditEntries: data ?? [],
    unavailable: false
  };
});

app.post<{
  Body: {
    clientCompanyName: string;
    cnpj: string;
    segment?: string;
    consultantEmail?: string;
    expectedEndAt?: string;
  };
}>("/m1/projects", async (request, reply) => {
  const { clientCompanyName, cnpj, segment, consultantEmail, expectedEndAt } = request.body;

  if (!clientCompanyName || !cnpj) {
    return reply.status(400).send({ ok: false, message: "Campos obrigatorios: clientCompanyName e cnpj." });
  }

  const supabase = createSupabaseAdminClient();
  const consultantTarget = consultantEmail?.trim() || "consultor@mktreal.com.br";

  const [{ data: orgData, error: orgError }, { data: consultantData, error: consultantError }] = await Promise.all([
    supabase.from("organizations").select("id").eq("name", "MKT Real").limit(1).maybeSingle(),
    supabase.from("users").select("id, role").eq("email", consultantTarget).limit(1).maybeSingle()
  ]);

  if (orgError || !orgData?.id) {
    return reply
      .status(500)
      .send({ ok: false, message: toUserMessage(orgError?.message ?? "Organizacao base nao encontrada.") });
  }

  if (consultantError || !consultantData?.id) {
    return reply
      .status(400)
      .send({
        ok: false,
        message: toUserMessage(consultantError?.message ?? "Consultor informado nao encontrado.")
      });
  }

  const { data: insertedProject, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: orgData.id,
      consultant_owner_id: consultantData.id,
      client_company_name: clientCompanyName,
      cnpj,
      segment: segment || null,
      started_at: new Date().toISOString().slice(0, 10),
      expected_end_at: expectedEndAt || null
    })
    .select("id, client_company_name, cnpj, segment, started_at, expected_end_at, created_at")
    .single();

  if (projectError || !insertedProject) {
    return reply
      .status(500)
      .send({ ok: false, message: toUserMessage(projectError?.message ?? "Falha ao criar projeto.") });
  }

  const stageRows = STAGE_SEQUENCE.map((stage, index) => ({
    project_id: insertedProject.id,
    stage,
    status: index === 0 ? "in_progress" : "not_started",
    automatic_checklist_ok: false,
    manual_confirmation_ok: false,
    required_client_decision_ok: false
  }));

  const { error: stageError } = await supabase.from("project_stage_state").insert(stageRows);
  if (stageError) {
    return reply.status(500).send({ ok: false, message: toUserMessage(stageError.message) });
  }

  return { ok: true, project: insertedProject };
});

app.put<{
  Params: { projectId: string };
  Body: {
    clientCompanyName: string;
    cnpj: string;
    segment?: string;
    expectedEndAt?: string;
  };
}>("/m1/projects/:projectId", async (request, reply) => {
  const { projectId } = request.params;
  const { clientCompanyName, cnpj, segment, expectedEndAt } = request.body;

  if (!clientCompanyName || !cnpj) {
    return reply.status(400).send({ ok: false, message: "Campos obrigatorios: clientCompanyName e cnpj." });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      client_company_name: clientCompanyName,
      cnpj,
      segment: segment || null,
      expected_end_at: expectedEndAt || null
    })
    .eq("id", projectId)
    .select("id, client_company_name, cnpj, segment, started_at, expected_end_at, created_at")
    .limit(1)
    .maybeSingle();

  if (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage(error.message) });
  }
  if (!data) {
    return reply.status(404).send({ ok: false, message: "Projeto nao encontrado para atualizacao." });
  }

  const auditResult = await writeAudit(projectId, "project.updated", {
    clientCompanyName,
    cnpj,
    segment: segment || null,
    expectedEndAt: expectedEndAt || null
  });

  return { ok: true, project: data, audit: auditResult };
});

app.delete<{
  Params: { projectId: string };
}>("/m1/projects/:projectId", async (request, reply) => {
  const { projectId } = request.params;
  const supabase = createSupabaseAdminClient();

  const { data: exists } = await supabase.from("projects").select("id").eq("id", projectId).limit(1).maybeSingle();
  if (!exists) {
    return reply.status(404).send({ ok: false, message: "Projeto nao encontrado para exclusao." });
  }

  // Audit must not reference a deleted project row.
  const auditResult = await writeAudit(null, "project.deleted", { projectId });

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage(error.message) });
  }

  return { ok: true, audit: auditResult };
});

app.patch<{
  Params: { projectId: string; stageCode: "I" | "D" | "E" | "A" | "L" };
  Body: {
    status: "not_started" | "in_progress" | "ready_for_completion" | "completed" | "reopened";
    automaticChecklistOk?: boolean;
    manualConfirmationOk?: boolean;
    requiredClientDecisionOk?: boolean;
    reason?: string;
  };
}>("/m1/projects/:projectId/stages/:stageCode", async (request, reply) => {
  const { projectId, stageCode } = request.params;
  const { status, automaticChecklistOk, manualConfirmationOk, requiredClientDecisionOk, reason } = request.body;

  if (!STAGE_SEQUENCE.includes(stageCode)) {
    return reply.status(400).send({ ok: false, message: "Etapa invalida." });
  }

  const supabase = createSupabaseAdminClient();
  const { data: current, error: currentError } = await supabase
    .from("project_stage_state")
    .select("id, status, automatic_checklist_ok, manual_confirmation_ok, required_client_decision_ok")
    .eq("project_id", projectId)
    .eq("stage", stageCode)
    .limit(1)
    .maybeSingle();

  if (currentError) {
    return reply.status(500).send({ ok: false, message: toUserMessage(currentError.message) });
  }
  if (!current) {
    return reply.status(404).send({ ok: false, message: "Etapa nao encontrada no projeto." });
  }

  const { data: updated, error: updateError } = await supabase
    .from("project_stage_state")
    .update({
      status,
      automatic_checklist_ok: automaticChecklistOk ?? current.automatic_checklist_ok ?? false,
      manual_confirmation_ok: manualConfirmationOk ?? current.manual_confirmation_ok ?? false,
      required_client_decision_ok: requiredClientDecisionOk ?? current.required_client_decision_ok ?? false,
      completed_at: status === "completed" ? new Date().toISOString() : null
    })
    .eq("id", current.id)
    .select(
      "id, stage, status, automatic_checklist_ok, manual_confirmation_ok, required_client_decision_ok, completed_at"
    )
    .limit(1)
    .maybeSingle();

  if (updateError) {
    return reply.status(500).send({ ok: false, message: toUserMessage(updateError.message) });
  }

  const actorUserId = await getAuditActorUserId();
  if (!actorUserId) {
    return reply.status(500).send({ ok: false, message: "Usuario de auditoria nao encontrado." });
  }
  await supabase.from("stage_state_history").insert({
    project_id: projectId,
    stage: stageCode,
    from_status: current.status,
    to_status: status,
    actor_user_id: actorUserId,
    reason: reason || "Atualizacao manual de etapa"
  });

  const auditResult = await writeAudit(projectId, "project.stage.updated", {
    stageCode,
    fromStatus: current.status,
    toStatus: status,
    automaticChecklistOk: automaticChecklistOk ?? current.automatic_checklist_ok ?? false,
    manualConfirmationOk: manualConfirmationOk ?? current.manual_confirmation_ok ?? false,
    requiredClientDecisionOk: requiredClientDecisionOk ?? current.required_client_decision_ok ?? false,
    reason: reason || "Atualizacao manual de etapa"
  });

  return { ok: true, stage: updated, audit: auditResult };
});

app.get<{
  Params: { projectId: string; stage: string };
}>("/m1/projects/:projectId/methodology/:stage", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }

  const { projectId } = request.params;
  const artifacts = getArtifactsByStage(stage);
  try {
    const states = await Promise.all(artifacts.map((artifact) => ensureArtifactState(projectId, stage, artifact)));
    const progress =
      states.length === 0
        ? 0
        : Math.round((states.reduce((sum, state) => sum + Number(state.completion_ratio || 0), 0) / states.length) * 100) /
          100;

    return {
      ok: true,
      stage,
      artifacts: artifacts.map((artifact, index) => ({
        code: artifact.code,
        name: artifact.name,
        description: artifact.description,
        visibility: artifact.visibility,
        state: states[index]
      })),
      progress
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.get<{
  Params: { projectId: string; stage: string; artifactCode: string };
}>("/m1/projects/:projectId/methodology/:stage/:artifactCode", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }

  const artifact = getArtifactByCode(stage, request.params.artifactCode);
  if (!artifact) {
    return reply.status(404).send({ ok: false, message: "Artefato nao encontrado para etapa informada." });
  }

  try {
    const state = await ensureArtifactState(request.params.projectId, stage, artifact);
    const answerRows = await loadArtifactAnswers(state.id);
    const answers = toFlatAnswers(answerRows);
    const completion = computeCompletion(artifact, answers);
    await upsertSectionStats(state.id, completion.sectionStats);

    return {
      ok: true,
      stage,
      artifact,
      state: {
        ...state,
        completion_ratio: completion.artifactCompletionRatio
      },
      answers,
      sections: completion.sectionStats
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.put<{
  Params: { projectId: string; stage: string; artifactCode: string };
  Body: { answers: Record<string, unknown> };
}>("/m1/projects/:projectId/methodology/:stage/:artifactCode", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }

  const artifact = getArtifactByCode(stage, request.params.artifactCode);
  if (!artifact) {
    return reply.status(404).send({ ok: false, message: "Artefato nao encontrado para etapa informada." });
  }

  const answers = parseJsonRecord(request.body?.answers);
  const fieldToSection = new Map<string, string>();
  artifact.sections.forEach((section) => {
    section.fields.forEach((field) => fieldToSection.set(field.code, section.code));
  });

  try {
    const state = await ensureArtifactState(request.params.projectId, stage, artifact);
    const supabase = createSupabaseAdminClient();
    const actorUserId = await getAuditActorUserId();

    const upsertRows = Object.entries(answers)
      .filter(([fieldCode]) => fieldToSection.has(fieldCode))
      .map(([fieldCode, value]) => ({
        artifact_id: state.id,
        section_code: fieldToSection.get(fieldCode) as string,
        field_code: fieldCode,
        value_json: value,
        updated_by: actorUserId
      }));

    if (upsertRows.length > 0) {
      const { error } = await supabase
        .from("project_artifact_answers")
        .upsert(upsertRows, { onConflict: "artifact_id,section_code,field_code" });
      if (error) {
        return reply.status(500).send({ ok: false, message: toUserMessage(error.message) });
      }
    }

    const refreshedRows = await loadArtifactAnswers(state.id);
    const flatAnswers = toFlatAnswers(refreshedRows);
    const completion = computeCompletion(artifact, flatAnswers);
    await upsertSectionStats(state.id, completion.sectionStats);

    const { error: updateError } = await supabase
      .from("project_stage_artifacts")
      .update({
        completion_ratio: completion.artifactCompletionRatio,
        status: "draft",
        updated_at: new Date().toISOString()
      })
      .eq("id", state.id);
    if (updateError) {
      return reply.status(500).send({ ok: false, message: toUserMessage(updateError.message) });
    }

    await writeAudit(request.params.projectId, "methodology.artifact.saved", {
      stage,
      artifactCode: artifact.code,
      fieldCount: upsertRows.length
    });

    return {
      ok: true,
      stage,
      artifactCode: artifact.code,
      completionRatio: completion.artifactCompletionRatio,
      answers: flatAnswers
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.post<{
  Params: { projectId: string; stage: string; artifactCode: string };
}>("/m1/projects/:projectId/methodology/:stage/:artifactCode/validate", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }
  const artifact = getArtifactByCode(stage, request.params.artifactCode);
  if (!artifact) {
    return reply.status(404).send({ ok: false, message: "Artefato nao encontrado para etapa informada." });
  }

  try {
    const state = await ensureArtifactState(request.params.projectId, stage, artifact);
    const answerRows = await loadArtifactAnswers(state.id);
    const answers = toFlatAnswers(answerRows);
    const completion = computeCompletion(artifact, answers);
    const validation = validateArtifactAnswers(artifact, answers);
    await upsertSectionStats(state.id, completion.sectionStats);

    const supabase = createSupabaseAdminClient();
    const { error: updateError } = await supabase
      .from("project_stage_artifacts")
      .update({
        completion_ratio: completion.artifactCompletionRatio,
        computed_json: validation.computed,
        validated_at: new Date().toISOString(),
        status: validation.ok ? "in_review" : "draft",
        updated_at: new Date().toISOString()
      })
      .eq("id", state.id);
    if (updateError) {
      return reply.status(500).send({ ok: false, message: toUserMessage(updateError.message) });
    }

    await writeAudit(request.params.projectId, "methodology.artifact.validated", {
      stage,
      artifactCode: artifact.code,
      ok: validation.ok,
      missingRequired: validation.missingRequired
    });

    return {
      ok: true,
      stage,
      artifactCode: artifact.code,
      completionRatio: completion.artifactCompletionRatio,
      validation
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.post<{
  Params: { projectId: string; stage: string; artifactCode: string };
}>("/m1/projects/:projectId/methodology/:stage/:artifactCode/complete", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }
  const artifact = getArtifactByCode(stage, request.params.artifactCode);
  if (!artifact) {
    return reply.status(404).send({ ok: false, message: "Artefato nao encontrado para etapa informada." });
  }

  try {
    const state = await ensureArtifactState(request.params.projectId, stage, artifact);
    const answers = toFlatAnswers(await loadArtifactAnswers(state.id));
    const completion = computeCompletion(artifact, answers);
    const validation = validateArtifactAnswers(artifact, answers);
    if (!validation.ok) {
      return reply.status(400).send({
        ok: false,
        message: "Nao foi possivel concluir: existem campos obrigatorios ou regras pendentes.",
        validation
      });
    }

    const supabase = createSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("project_stage_artifacts")
      .update({
        status: "completed",
        completion_ratio: completion.artifactCompletionRatio,
        computed_json: validation.computed,
        validated_at: nowIso,
        completed_at: nowIso,
        updated_at: nowIso
      })
      .eq("id", state.id);
    if (updateError) {
      return reply.status(500).send({ ok: false, message: toUserMessage(updateError.message) });
    }

    const stageArtifacts = getArtifactsByStage(stage);
    const { data: stageStates, error: stageStatesError } = await supabase
      .from("project_stage_artifacts")
      .select("artifact_code, status")
      .eq("project_id", request.params.projectId)
      .eq("stage", stage);
    if (stageStatesError) {
      return reply.status(500).send({ ok: false, message: toUserMessage(stageStatesError.message) });
    }
    const completedArtifactCodes = new Set((stageStates ?? []).filter((item) => item.status === "completed").map((item) => item.artifact_code));
    const stageIsCompleted = stageArtifacts.every((item) => completedArtifactCodes.has(item.code));

    if (stageIsCompleted) {
      await supabase
        .from("project_stage_state")
        .update({
          status: "completed",
          automatic_checklist_ok: true,
          manual_confirmation_ok: true,
          required_client_decision_ok: true,
          completed_at: nowIso
        })
        .eq("project_id", request.params.projectId)
        .eq("stage", stage);
    }

    await writeAudit(request.params.projectId, "methodology.artifact.completed", {
      stage,
      artifactCode: artifact.code,
      stageCompleted: stageIsCompleted
    });

    return {
      ok: true,
      stage,
      artifactCode: artifact.code,
      stageCompleted: stageIsCompleted
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.get<{
  Params: { projectId: string; stage: string };
}>("/m1/projects/:projectId/methodology/:stage/report-preview", async (request, reply) => {
  const stage = normalizeStage(request.params.stage);
  if (!stage) {
    return reply.status(400).send({ ok: false, message: "Etapa metodologica invalida." });
  }

  const artifacts = getArtifactsByStage(stage);
  try {
    const previewBlocks: string[] = [];
    for (const artifact of artifacts) {
      const state = await ensureArtifactState(request.params.projectId, stage, artifact);
      const answers = toFlatAnswers(await loadArtifactAnswers(state.id));
      previewBlocks.push(`## ${artifact.name}`);
      previewBlocks.push(`Status: ${state.status} | Progresso: ${state.completion_ratio}%`);
      for (const section of artifact.sections) {
        previewBlocks.push(`### ${section.title}`);
        for (const field of section.fields) {
          const value = answers[field.code];
          const rendered = value === undefined || value === null || value === "" ? "-" : JSON.stringify(value);
          previewBlocks.push(`- ${field.label}: ${rendered}`);
        }
      }
      const computed = parseJsonRecord(state.computed_json);
      if (Object.keys(computed).length > 0) {
        previewBlocks.push(`### Resultado Calculado`);
        previewBlocks.push(`\`\`\`json\n${JSON.stringify(computed, null, 2)}\n\`\`\``);
      }
    }

    return {
      ok: true,
      stage,
      preview: `# Previa de Relatorio - ${stage}\n\n${previewBlocks.join("\n")}`
    };
  } catch (error) {
    return reply.status(500).send({ ok: false, message: toUserMessage((error as Error).message) });
  }
});

app.listen({ port: 3333, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
