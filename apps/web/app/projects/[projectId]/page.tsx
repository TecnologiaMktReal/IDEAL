"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../../../lib/api";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import { GlassCard, GlassTopbar, StageStepper } from "@ideal/ui";
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
  Building2, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  History,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StageStatus =
  | "not_started"
  | "in_progress"
  | "ready_for_completion"
  | "completed"
  | "reopened";

type ProjectPayload = {
  id: string;
  client_company_name: string;
  cnpj: string;
  segment: string | null;
  started_at: string | null;
  expected_end_at: string | null;
  created_at: string;
};

type StagePayload = {
  id: string;
  stage: "I" | "D" | "E" | "A" | "L";
  status: StageStatus;
  automatic_checklist_ok: boolean;
  manual_confirmation_ok: boolean;
  required_client_decision_ok: boolean;
  completed_at: string | null;
};

type AuditEntry = {
  id: string;
  action_code: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type AuditActionFilter = "all" | "project.updated" | "project.deleted" | "project.stage.updated";
type AuditRangeFilter = "all" | "7d" | "30d";

type StageEditPayload = {
  status: StageStatus;
  automaticChecklistOk: boolean;
  manualConfirmationOk: boolean;
  requiredClientDecisionOk: boolean;
  reason: string;
};

const STAGE_LABEL: Record<StagePayload["stage"], string> = {
  I: "Imersao",
  D: "Diagnostico",
  E: "Estrutura",
  A: "Arquitetura",
  L: "Loop"
};

const STAGE_ORDER: StagePayload["stage"][] = ["I", "D", "E", "A", "L"];

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectPayload | null>(null);
  const [stages, setStages] = useState<StagePayload[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditUnavailable, setAuditUnavailable] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState<AuditActionFilter>("all");
  const [auditRangeFilter, setAuditRangeFilter] = useState<AuditRangeFilter>("all");
  const [stageEdits, setStageEdits] = useState<Record<string, StageEditPayload>>({});
  const [savingStageId, setSavingStageId] = useState<string | null>(null);

  const filteredAuditEntries = useMemo(() => {
    const now = Date.now();
    return auditEntries.filter((entry) => {
      if (auditActionFilter !== "all" && entry.action_code !== auditActionFilter) {
        return false;
      }
      if (auditRangeFilter === "all") return true;
      const createdAtMs = new Date(entry.created_at).getTime();
      if (!Number.isFinite(createdAtMs)) return false;
      const maxAgeMs = auditRangeFilter === "7d" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      return now - createdAtMs <= maxAgeMs;
    });
  }, [auditEntries, auditActionFilter, auditRangeFilter]);

  const computedAlerts = useMemo(() => {
    const alerts: Array<{ type: "warning" | "urgent" | "info", title: string, description: string }> = [];
    if (stages.length === 0) return alerts;

    const imersao = stages.find(s => s.stage === "I");
    const diagnostico = stages.find(s => s.stage === "D");
    const estrutura = stages.find(s => s.stage === "E");
    const arquitetura = stages.find(s => s.stage === "A");
    const loop = stages.find(s => s.stage === "L");

    if (imersao?.status === "not_started") {
      alerts.push({ type: "info", title: "Kickoff de Projeto Pendente", description: "Inicie a Imersão (I) para destravar o diagnóstico do cliente." });
    }

    if (diagnostico?.status === "in_progress") {
      alerts.push({ type: "warning", title: "Diagnóstico em Aberto", description: "Certifique-se de preencher todos os 28 eixos da Camada 2 para o cálculo exato da Maturidade." });
    }

    if (arquitetura?.status === "completed" && loop?.status === "not_started") {
      alerts.push({ type: "urgent", title: "Motor do Loop Parado", description: "A arquitetura está aprovada. É mandatório ativar os rituais de otimização (L) imediatamente." });
    }

    if (diagnostico?.status === "completed" && estrutura?.status === "not_started") {
      alerts.push({ type: "warning", title: "Herança Diagnóstica Pendente", description: "Os gargalos foram identificados. Inicialize a Estrutura (E) para absorver as ações sugeridas pendentes." });
    }

    return alerts;
  }, [stages]);

  useEffect(() => {
    if (!params?.projectId) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      loadData();
    });
  }, [params?.projectId]);

  async function loadData() {
    if (!params?.projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [projectResponse, auditResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/m1/projects/${params.projectId}`),
        fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/audit`)
      ]);
      const projectPayload = await projectResponse.json();
      const auditPayload = await auditResponse.json();

      if (!projectResponse.ok || !projectPayload.ok) {
        setError(projectPayload.message || "Falha ao carregar projeto.");
        setLoading(false);
        return;
      }
      setProject(projectPayload.project);
      
      const sortedStages = (projectPayload.stages || []).sort((a: StagePayload, b: StagePayload) => 
        STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      );
      setStages(sortedStages);

      const mapped: Record<string, StageEditPayload> = {};
      sortedStages.forEach((stage: StagePayload) => {
        mapped[stage.id] = {
          status: stage.status,
          automaticChecklistOk: stage.automatic_checklist_ok,
          manualConfirmationOk: stage.manual_confirmation_ok,
          requiredClientDecisionOk: stage.required_client_decision_ok,
          reason: ""
        };
      });
      setStageEdits(mapped);

      if (auditResponse.ok && auditPayload.ok) {
        setAuditEntries(auditPayload.auditEntries || []);
        setAuditUnavailable(Boolean(auditPayload.unavailable));
      } else {
        setAuditUnavailable(true);
      }
    } catch (e) {
      setError("Erro de conexao com o servidor.");
    }
    setLoading(false);
  }

  async function handleStageSave(stage: StagePayload) {
    const edit = stageEdits[stage.id];
    if (!edit || !params?.projectId) return;

    setSavingStageId(stage.id);
    setError(null);
    setSuccess(null);

    const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/stages/${stage.stage}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit)
    });
    const payload = await response.json();
    setSavingStageId(null);

    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao atualizar etapa.");
      return;
    }

    setSuccess(`Etapa ${stage.stage} - ${STAGE_LABEL[stage.stage]} atualizada.`);
    setTimeout(() => setSuccess(null), 3000);
    loadData();
  }

  const stepperStages = stages.map(s => ({
    stage: s.stage,
    label: STAGE_LABEL[s.stage],
    status: s.status as any
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-mkt-accent border-t-transparent rounded-full animate-spin" />
           <span className="text-sm font-black text-mkt-primary uppercase tracking-widest">Carregando Hub...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center p-8">
        <GlassCard className="max-w-md w-full !p-12 text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-mkt-dark mb-4">Acesso Negado</h2>
          <p className="text-mkt-primary/60 font-medium mb-8">{error || "Projeto nao encontrado ou indisponivel."}</p>
          <Link href="/projects">
            <button className="mkt-button-premium w-full">Voltar para Projetos</button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col">
      <GlassTopbar>
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <button className="p-2.5 rounded-xl hover:bg-mkt-primary/10 transition-colors text-mkt-primary">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-mkt-dark tracking-tight">{project.client_company_name}</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mkt-primary/60">Hub de Gestao Metodologica</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Link href={`/projects/${project.id}/methodology`}>
            <button className="mkt-button-premium flex items-center gap-2 !py-2.5 !px-5">
              <LayoutDashboard size={18} />
              <span>Execucao IDEAL</span>
            </button>
          </Link>
          <button className="p-2.5 rounded-xl bg-white/40 border border-mkt-primary/10 text-mkt-primary hover:bg-white/60 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-8">
        {/* Pipeline Overview */}
        <section className="space-y-4">
           <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-mkt-primary/40 mb-1">Pipeline Metodologico</h3>
                <p className="text-xs font-bold text-mkt-primary/60">Acompanhe a evolucao cronologica do projeto</p>
              </div>
           </div>
           <GlassCard className="!p-10 !bg-white/40">
              <StageStepper stages={stepperStages} />
           </GlassCard>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Stage Management */}
          <section className="xl:col-span-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-mkt-primary/40">Gestao de Etapas</h3>
            <div className="space-y-4">
              {stages.map((stage) => (
                <GlassCard key={stage.id} className={`!p-0 border-l-8 overflow-hidden transition-all duration-300 ${
                  stage.status === 'completed' ? 'border-emerald-500 bg-emerald-50/5' : 
                  stage.status === 'in_progress' ? 'border-mkt-accent bg-mkt-accent/5' : 
                  'border-mkt-primary/10'
                }`}>
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
                        stage.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                        stage.status === 'in_progress' ? 'bg-mkt-accent text-mkt-dark shadow-lg shadow-mkt-accent/20' : 
                        'bg-mkt-primary/5 text-mkt-primary/40'
                      }`}>
                        {stage.stage}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-mkt-dark tracking-tight">{STAGE_LABEL[stage.stage]}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            stage.status === 'completed' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5' : 
                            stage.status === 'in_progress' ? 'border-mkt-accent/30 text-mkt-accent bg-mkt-accent/5' : 
                            'border-mkt-primary/20 text-mkt-primary/40'
                          }`}>
                            {stage.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                       <div className="flex items-center gap-4 bg-mkt-primary/5 px-4 py-2 rounded-xl">
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={stageEdits[stage.id]?.automaticChecklistOk}
                                onChange={(e) => setStageEdits({...stageEdits, [stage.id]: {...(stageEdits[stage.id] as StageEditPayload), automaticChecklistOk: e.target.checked}})}
                             />
                             <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${stageEdits[stage.id]?.automaticChecklistOk ? 'bg-mkt-accent border-mkt-accent' : 'border-mkt-primary/20 group-hover:border-mkt-accent'}`}>
                                {stageEdits[stage.id]?.automaticChecklistOk && <CheckCircle2 size={12} className="text-mkt-dark" />}
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/60">Auto</span>
                          </label>
                          <div className="w-[1px] h-4 bg-mkt-primary/10" />
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={stageEdits[stage.id]?.manualConfirmationOk}
                                onChange={(e) => setStageEdits({...stageEdits, [stage.id]: {...(stageEdits[stage.id] as StageEditPayload), manualConfirmationOk: e.target.checked}})}
                             />
                             <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${stageEdits[stage.id]?.manualConfirmationOk ? 'bg-mkt-accent border-mkt-accent' : 'border-mkt-primary/20 group-hover:border-mkt-accent'}`}>
                                {stageEdits[stage.id]?.manualConfirmationOk && <CheckCircle2 size={12} className="text-mkt-dark" />}
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/60">Manual</span>
                          </label>
                       </div>

                       <select 
                          className="bg-white px-4 py-2.5 rounded-xl border border-mkt-primary/10 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-mkt-accent transition-all"
                          value={stageEdits[stage.id]?.status}
                          onChange={(e) => setStageEdits({...stageEdits, [stage.id]: {...(stageEdits[stage.id] as StageEditPayload), status: e.target.value as any}})}
                       >
                          <option value="not_started">Nao Iniciada</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="ready_for_completion">Pronta</option>
                          <option value="completed">Concluida</option>
                          <option value="reopened">Reaberta</option>
                       </select>

                       <button 
                        onClick={() => handleStageSave(stage)}
                        disabled={savingStageId === stage.id}
                        className="p-3 rounded-xl bg-mkt-dark text-white hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
                       >
                         {savingStageId === stage.id ? <Clock size={18} className="animate-spin" /> : <Save size={18} />}
                       </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Right: Summary & Audit */}
          <section className="xl:col-span-4 space-y-6">
             <div className="space-y-6 sticky top-28">

                {/* Motor Habitual / Alertas */}
                {computedAlerts.length > 0 && (
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-500/80">Ações Exigidas</h3>
                         <AlertCircle size={16} className="text-red-500/40 animate-pulse" />
                      </div>
                      <div className="space-y-3">
                         {computedAlerts.map((alert, idx) => (
                            <GlassCard key={idx} className={`!p-5 border-l-4 ${
                               alert.type === 'urgent' ? 'border-red-500 bg-red-50' : 
                               alert.type === 'warning' ? 'border-amber-500 bg-amber-50' : 
                               'border-blue-500 bg-blue-50'
                            }`}>
                               <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${
                                  alert.type === 'urgent' ? 'text-red-700' : 
                                  alert.type === 'warning' ? 'text-amber-700' : 
                                  'text-blue-700'
                               }`}>{alert.title}</h4>
                               <p className="text-[10px] font-bold text-mkt-dark/70 leading-relaxed">{alert.description}</p>
                            </GlassCard>
                         ))}
                      </div>
                   </div>
                )}

                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-mkt-primary/40 mt-8">Ficha do Projeto</h3>
                <GlassCard className="!p-8 space-y-6">
                   <div className="flex items-center gap-4 pb-6 border-b border-mkt-primary/5">
                      <div className="p-3 rounded-2xl bg-mkt-accent/10 text-mkt-accent">
                         <Building2 size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/40">Cliente</span>
                        <h4 className="text-lg font-black text-mkt-dark leading-tight">{project.client_company_name}</h4>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">CNPJ</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-mkt-primary/60">
                           <FileText size={12} />
                           {project.cnpj}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">Segmento</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-mkt-primary/60">
                           <LayoutDashboard size={12} />
                           {project.segment || "Nao inf."}
                        </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-mkt-primary/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">Data de Inicio</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-mkt-primary/60">
                           <Calendar size={12} />
                           {project.started_at || "-"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">Previsao</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-mkt-primary/60 justify-end">
                           <Clock size={12} />
                           {project.expected_end_at || "-"}
                        </div>
                      </div>
                   </div>
                </GlassCard>

                <div className="flex justify-between items-center px-1">
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-mkt-primary/40">Auditoria</h3>
                   <History size={16} className="text-mkt-primary/20" />
                </div>

                <GlassCard className="!p-6 max-h-[400px] overflow-hidden flex flex-col">
                   <div className="flex gap-2 mb-4">
                      <select 
                        className="flex-1 bg-white/40 px-3 py-1.5 rounded-lg border border-mkt-primary/5 text-[10px] font-black uppercase tracking-widest outline-none"
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value as any)}
                      >
                         <option value="all">Todos Eventos</option>
                         <option value="project.stage.updated">Etapas</option>
                         <option value="project.updated">Cadastro</option>
                      </select>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                      {filteredAuditEntries.length === 0 ? (
                        <div className="text-center py-12 text-mkt-primary/30 text-[10px] font-black uppercase tracking-widest">
                           {auditUnavailable ? "Auditoria Indisponivel" : "Nenhum Registro"}
                        </div>
                      ) : (
                        filteredAuditEntries.map((entry) => (
                          <div key={entry.id} className="p-3 rounded-xl bg-white/40 border border-mkt-primary/5 space-y-2">
                             <div className="flex justify-between items-start">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                  entry.action_code === 'project.stage.updated' ? 'border-mkt-accent/20 text-mkt-accent bg-mkt-accent/5' : 'border-mkt-primary/20 text-mkt-primary/40 bg-mkt-primary/5'
                                }`}>
                                   {entry.action_code.split('.')[1]}
                                </span>
                                <span className="text-[8px] font-bold text-mkt-primary/30">{new Date(entry.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-[10px] font-bold text-mkt-primary/60 line-clamp-2 italic leading-relaxed">
                                {entry.action_code === 'project.stage.updated' ? `Etapa ${entry.payload.stageCode} atualizada para ${entry.payload.toStatus}` : 'Dados do projeto atualizados'}
                             </p>
                          </div>
                        ))
                      )}
                   </div>
                </GlassCard>
             </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] p-4 rounded-2xl bg-mkt-dark text-white border border-mkt-accent/20 shadow-2xl flex items-center gap-3"
          >
             <CheckCircle2 className="text-mkt-accent" size={20} />
             <span className="text-sm font-black tracking-tight">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

