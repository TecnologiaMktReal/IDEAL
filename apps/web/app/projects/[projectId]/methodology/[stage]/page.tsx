"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../../../../../lib/api";
import { getSupabaseBrowserClient } from "../../../../../lib/supabase/client";
import { GlassCard, GlassTopbar } from "@ideal/ui";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  HelpCircle, 
  Zap, 
  Clock, 
  Search,
  LayoutDashboard,
  Eye,
  History,
  Info,
  ExternalLink,
  ChevronDown,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploadDropzone } from "../../../../components/FileUploadDropzone";

type FieldType = "text" | "textarea" | "number" | "date" | "checkbox" | "select" | "json" | "file";

type ArtifactSchema = {
  code: string;
  name: string;
  stage: string;
  description: string;
  sections: Array<{
    code: string;
    title: string;
    description: string;
    fields: Array<{
      code: string;
      label: string;
      type: FieldType;
      required?: boolean;
      helpText: string;
      acceptanceCriteria?: string;
      sourceReference: string;
      options?: Array<{ value: string; label: string }>;
      min?: number;
      max?: number;
    }>;
  }>;
};

type ArtifactState = {
  id: string;
  status: string;
  completion_ratio: number;
  computed_json: Record<string, unknown>;
  validated_at: string | null;
  completed_at: string | null;
};

type StageOverview = {
  stage: string;
  progress: number;
  artifacts: Array<{
    code: string;
    name: string;
    description: string;
    state: { status: string; completion_ratio: number };
  }>;
};

type ValidationPayload = {
  ok: boolean;
  missingRequired: string[];
  issues: Array<{ code: string; level: "error" | "warning"; message: string }>;
  computed: Record<string, unknown>;
};

type AuditEntry = {
  id: string;
  action_code: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export default function StageMethodologyPage() {
  const params = useParams<{ projectId: string; stage: string }>();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [overview, setOverview] = useState<StageOverview | null>(null);
  const [selectedArtifactCode, setSelectedArtifactCode] = useState<string>("");
  const [artifact, setArtifact] = useState<ArtifactSchema | null>(null);
  const [artifactState, setArtifactState] = useState<ArtifactState | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [validation, setValidation] = useState<ValidationPayload | null>(null);
  const [reportPreview, setReportPreview] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [activeHelpField, setActiveHelpField] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      loadStageOverview();
    });
  }, [params?.projectId, params?.stage]);

  async function loadStageOverview() {
    if (!params?.projectId || !params?.stage) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || "Falha ao carregar etapa.");
        setLoading(false);
        return;
      }
      setOverview(payload);
      const nextCode = selectedArtifactCode || payload.artifacts[0]?.code || "";
      setSelectedArtifactCode(nextCode);
      if (nextCode) {
        await loadArtifact(nextCode);
      } else {
        setLoading(false);
      }
      await loadAudit();
    } catch (requestError) {
      setError((requestError as Error).message);
      setLoading(false);
    }
  }

  async function loadAudit() {
    if (!params?.projectId) return;
    const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/audit`);
    const payload = await response.json();
    if (!response.ok || !payload.ok) return;
    const entries = (payload.auditEntries || []) as AuditEntry[];
    setAuditEntries(entries.filter((entry) => entry.action_code.startsWith("methodology.")));
  }

  async function loadArtifact(artifactCode: string) {
    if (!params?.projectId || !params?.stage) return;
    setLoading(true);
    const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}/${artifactCode}`);
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao carregar artefato.");
      setLoading(false);
      return;
    }
    setArtifact(payload.artifact);
    setArtifactState(payload.state);
    setAnswers(payload.answers || {});
    setSuggestions(payload.computed_suggestions || []);
    setLoading(false);
    setValidation(null);
  }

  function renderField(field: ArtifactSchema["sections"][number]["fields"][number]) {
    const currentValue = answers[field.code];
    const baseClass = "w-full bg-white/60 border border-mkt-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-mkt-accent focus:border-mkt-accent transition-all text-sm font-bold text-mkt-primary placeholder:text-mkt-primary/20";

    if (field.type === "textarea" || field.type === "json") {
      return (
        <textarea
          className={`${baseClass} min-h-[120px] resize-y`}
          rows={field.type === "json" ? 8 : 4}
          placeholder={field.helpText}
          value={
            field.type === "json"
              ? typeof currentValue === "object" && currentValue !== null
                ? safeStringify(currentValue)
                : typeof currentValue === "string"
                  ? currentValue
                  : ""
              : String(currentValue ?? "")
          }
          onChange={(event) => {
            const raw = event.target.value;
            if (field.type === "json") {
              try {
                const parsed = raw.trim() ? JSON.parse(raw) : {};
                setAnswers((current) => ({ ...current, [field.code]: parsed }));
              } catch {
                setAnswers((current) => ({ ...current, [field.code]: raw }));
              }
              return;
            }
            setAnswers((current) => ({ ...current, [field.code]: raw }));
          }}
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="hidden"
            checked={Boolean(currentValue)}
            onChange={(event) => setAnswers((current) => ({ ...current, [field.code]: event.target.checked }))}
          />
          <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${(currentValue as boolean) ? 'bg-mkt-accent border-mkt-accent' : 'border-mkt-primary/20 group-hover:border-mkt-accent'}`}>
             {(currentValue as boolean) && <CheckCircle2 size={16} className="text-mkt-dark" />}
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-mkt-primary/60 group-hover:text-mkt-accent transition-colors">Marcar como Atendido</span>
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <select
          className={`${baseClass} appearance-none cursor-pointer`}
          value={String(currentValue ?? "")}
          onChange={(event) => setAnswers((current) => ({ ...current, [field.code]: event.target.value }))}
        >
          <option value="">Selecione uma opcao...</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "file") {
      return (
        <FileUploadDropzone 
          projectId={params.projectId}
          currentValue={currentValue as string}
          onUploadSuccess={(url: string) => setAnswers((current) => ({ ...current, [field.code]: url }))}
        />
      );
    }

    return (
      <input
        className={baseClass}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        placeholder={field.helpText}
        value={String(currentValue ?? "")}
        min={field.min}
        max={field.max}
        onChange={(event) => {
          if (field.type === "number") {
            const parsed = Number(event.target.value);
            setAnswers((current) => ({ ...current, [field.code]: Number.isFinite(parsed) ? parsed : "" }));
            return;
          }
          setAnswers((current) => ({ ...current, [field.code]: event.target.value }));
        }}
      />
    );
  }

  async function saveAnswers() {
    if (!artifact || !params?.projectId || !params?.stage) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}/${artifact.code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao salvar respostas.");
      return;
    }
    setSuccess("Respostas preservadas com sucesso.");
    setTimeout(() => setSuccess(null), 3000);
    loadStageOverview();
  }

  async function validateArtifact() {
    if (!artifact || !params?.projectId || !params?.stage) return;
    setValidating(true);
    setError(null);
    const response = await fetch(
      `${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}/${artifact.code}/validate`,
      { method: "POST" }
    );
    const payload = await response.json();
    setValidating(true); // Artificial delay or real load? Set to false after payload
    setTimeout(() => {
      setValidating(false);
      if (!response.ok || !payload.ok) {
        setError(payload.message || "Falha na validacao do artefato.");
        return;
      }
      setValidation(payload.validation);
      setSuccess("Validacao concluida com observacoes.");
    }, 800);
    loadStageOverview();
  }

  async function completeArtifact() {
    if (!artifact || !params?.projectId || !params?.stage) return;
    setCompleting(true);
    setError(null);
    const response = await fetch(
      `${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}/${artifact.code}/complete`,
      { method: "POST" }
    );
    const payload = await response.json();
    setCompleting(false);
    if (!response.ok || !payload.ok) {
      setError(payload.message || "Nao foi possivel concluir o artefato.");
      if (payload.validation) setValidation(payload.validation);
      return;
    }
    setSuccess(payload.stageCompleted ? "Etapa Finalizada!" : "Artefato Concluido.");
    loadStageOverview();
  }

  async function loadReportPreview() {
    if (!params?.projectId || !params?.stage) return;
    const response = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${params.stage}/report-preview`);
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao carregar previa.");
      return;
    }
    setReportPreview(payload.preview || "");
  }

  function handlePrint() {
    if (!reportPreview) {
      loadReportPreview().then(() => {
        setTimeout(() => window.print(), 500);
      });
    } else {
      window.print();
    }
  }

  if (loading && !overview) {
    return (
       <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-mkt-accent border-t-transparent rounded-full animate-spin" />
           <span className="text-sm font-black text-mkt-primary uppercase tracking-widest">Acessando Nucleo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col">
      <GlassTopbar>
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.projectId}/methodology`}>
            <button className="p-2.5 rounded-xl hover:bg-mkt-primary/10 transition-colors text-mkt-primary">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-mkt-dark tracking-tight uppercase">Etapa {params.stage}</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mkt-primary/60 italic">Productivity Center</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadReportPreview}
            className="mkt-button-premium !py-2.5 flex items-center gap-2 no-print"
          >
            <Eye size={18} />
            <span>Previa</span>
          </button>
          <button 
            onClick={handlePrint}
            className="mkt-button-premium !py-2.5 !bg-emerald-600 !from-emerald-600 !to-emerald-500 flex items-center gap-2 no-print"
          >
            <Printer size={18} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        {/* Left Sidebar: Artifact Selection */}
        <aside className="xl:col-span-3 space-y-6">
           <div className="sticky top-28 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 px-2">Artefatos da Etapa</h3>
              <div className="space-y-3">
                 {overview?.artifacts.map((art) => (
                    <button
                       key={art.code}
                       onClick={() => setSelectedArtifactCode(art.code) ?? loadArtifact(art.code)}
                       className={`w-full p-5 rounded-2xl flex flex-col gap-1 text-left transition-all duration-300 border ${
                          selectedArtifactCode === art.code 
                          ? 'bg-mkt-dark text-white border-mkt-dark shadow-xl shadow-mkt-dark/20' 
                          : 'bg-white/40 text-mkt-primary border-mkt-primary/5 hover:bg-white/80'
                       }`}
                    >
                       <div className="flex justify-between items-center w-full">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedArtifactCode === art.code ? 'text-mkt-accent' : 'text-mkt-primary/40'}`}>
                             {art.code}
                          </span>
                          <span className={`text-[10px] font-black italic ${selectedArtifactCode === art.code ? 'text-white/60' : 'text-mkt-primary/40'}`}>
                             {art.state.completion_ratio}%
                          </span>
                       </div>
                       <span className="text-sm font-black tracking-tight line-clamp-1">{art.name}</span>
                    </button>
                 ))}
              </div>

              {reportPreview && (
                <GlassCard className="!p-6 max-h-[300px] overflow-hidden flex flex-col bg-emerald-50/50 border-emerald-500/20 preview-report-container">
                   <div className="flex justify-between items-center mb-3 no-print">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Previa de Relatorio</span>
                      <button onClick={() => setReportPreview("")} className="text-emerald-600/40 hover:text-emerald-600">
                         <ChevronDown size={14} className="rotate-180" />
                      </button>
                   </div>
                   <pre className="text-[9px] font-bold text-emerald-800 italic overflow-y-auto whitespace-pre-wrap leading-relaxed opacity-60 pr-2 custom-scrollbar">
                      {reportPreview}
                   </pre>
                </GlassCard>
              )}
           </div>
        </aside>

        {/* Center Content: Form */}
        <div className="xl:col-span-6 space-y-8">
           <AnimatePresence mode="wait">
              {artifact ? (
                <motion.div 
                   key={artifact.code}
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-8 pb-24"
                >
                   {suggestions.length > 0 && (
                      <div className="mb-8 bg-mkt-dark p-6 rounded-2xl border-l-4 border-mkt-accent shadow-xl relative overflow-hidden">
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-mkt-accent/10 blur-2xl rounded-full pointer-events-none" />
                         <h3 className="text-sm font-black uppercase tracking-widest text-mkt-accent mb-4 flex items-center gap-2 relative z-10 transition-colors">
                            <AlertCircle size={16} />
                            Pontos de Fuga Identificados no Diagnóstico
                         </h3>
                         <ul className="space-y-3 relative z-10">
                            {suggestions.map((sug, i) => (
                               <li key={i} className="text-xs font-bold text-white/90 bg-white/5 p-3 rounded-lg border border-white/10 leading-relaxed shadow-sm">
                                  {sug}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}
                   <div>
                      <h2 className="text-3xl font-black text-mkt-dark tracking-tight mb-2 italic">
                         {artifact.name}
                      </h2>
                      <p className="text-sm font-bold text-mkt-primary/60 leading-relaxed max-w-2xl">
                         {artifact.description}
                      </p>
                   </div>

                   {artifact.sections.map((section) => (
                      <GlassCard key={section.code} className="!p-10 space-y-10 border-l-8 border-mkt-primary/10">
                         <div>
                            <h3 className="text-xl font-black text-mkt-dark tracking-tight mb-1 uppercase italic">{section.title}</h3>
                            <p className="text-xs font-bold text-mkt-primary/40 tracking-tight">{section.description}</p>
                         </div>

                         <div className="space-y-8">
                            {section.fields.map((field) => (
                               <div key={field.code} className="group relative">
                                  <div className="flex justify-between items-center mb-3">
                                     <label className="text-xs font-black uppercase tracking-widest text-mkt-dark">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                     </label>
                                     <button 
                                        onClick={() => setActiveHelpField(activeHelpField === field.code ? null : field.code)}
                                        className={`p-1 rounded-lg transition-colors ${activeHelpField === field.code ? 'text-mkt-accent bg-mkt-accent/10' : 'text-mkt-primary/20 hover:text-mkt-primary'}`}
                                     >
                                        <HelpCircle size={16} />
                                     </button>
                                  </div>
                                  
                                  <AnimatePresence>
                                     {activeHelpField === field.code && (
                                        <motion.div 
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: 'auto', opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           className="overflow-hidden mb-4"
                                        >
                                           <div className="p-4 rounded-xl bg-mkt-accent/5 border border-mkt-accent/20 space-y-3">
                                              <div className="flex items-start gap-3">
                                                 <Zap size={14} className="text-mkt-accent mt-0.5" />
                                                 <p className="text-[10px] font-bold text-mkt-primary/60 leading-relaxed">
                                                    <span className="font-black text-mkt-dark block mb-1">METODOLOGIA:</span>
                                                    {field.helpText}
                                                 </p>
                                              </div>
                                              <div className="flex items-start gap-3 pt-2 border-t border-mkt-accent/10">
                                                 <Info size={14} className="text-mkt-primary/40 mt-0.5" />
                                                 <p className="text-[10px] font-bold text-mkt-primary/40 uppercase">
                                                    Ref: {field.sourceReference}
                                                 </p>
                                              </div>
                                           </div>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>

                                  <div className="relative">
                                     {renderField(field)}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </GlassCard>
                   ))}
                </motion.div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 space-y-6">
                   <div className="w-20 h-20 rounded-full bg-mkt-primary/5 flex items-center justify-center text-mkt-primary/20 shadow-inner">
                      <Search size={40} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-mkt-primary/40 mb-2">Aguardando Selecao</h3>
                      <p className="text-xs font-bold text-mkt-primary/30 max-w-xs">Escolha um artefato metodologico para iniciar o preenchimento guiado.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>

        {/* Right Sidebar: Status & Actions */}
        <aside className="xl:col-span-3 space-y-6">
           <div className="sticky top-28 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 px-2">Controle do Artefato</h3>
              <GlassCard className="!p-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">Status</span>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${artifactState?.status === 'completed' ? 'bg-emerald-500 animate-pulse' : 'bg-mkt-accent'}`} />
                          <span className="text-xs font-black uppercase tracking-widest text-mkt-dark italic">
                             {artifactState?.status || "Draft"}
                          </span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/30 block mb-1">Conclusao</span>
                       <span className="text-2xl font-black italic text-mkt-dark">{artifactState?.completion_ratio || 0}%</span>
                    </div>
                 </div>

                 <div className="space-y-3 pt-6 border-t border-mkt-primary/5">
                    <button 
                       onClick={saveAnswers}
                       disabled={saving || !artifact}
                       className="mkt-button-premium w-full flex items-center justify-center gap-3 !py-4"
                    >
                       {saving ? <Clock size={18} className="animate-spin" /> : <Save size={18} />}
                       <span>Preservar Rascunho</span>
                    </button>
                    <button 
                       onClick={validateArtifact}
                       disabled={validating || !artifact}
                       className="w-full py-4 text-xs font-black uppercase tracking-widest text-mkt-primary hover:bg-mkt-primary/5 border border-mkt-primary/10 rounded-2xl transition-all flex items-center justify-center gap-3 bg-white"
                    >
                       {validating ? <Clock size={18} className="animate-spin" /> : <Zap size={18} className="text-mkt-accent" />}
                       <span>Validar Metodologia</span>
                    </button>
                    <button 
                       onClick={completeArtifact}
                       disabled={completing || !artifact}
                       className="w-full py-4 text-xs font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 border border-emerald-500/20 rounded-2xl transition-all flex items-center justify-center gap-3 bg-emerald-50/30"
                    >
                       {completing ? <Clock size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                       <span>Finalizar Entrega</span>
                    </button>
                 </div>
              </GlassCard>

              {validation && (
                 <GlassCard className="!p-6 space-y-4 bg-white/40 border-l-8 border-mkt-accent">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-dark flex items-center gap-2">
                       <Zap size={14} className="text-mkt-accent" />
                       Validacao Ativa
                    </h4>
                    
                    {validation.missingRequired.length > 0 && (
                       <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-red-500">Campos Pendentes</span>
                          {validation.missingRequired.slice(0, 3).map((item, i) => (
                             <div key={i} className="text-[9px] font-bold text-mkt-primary/60 flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                {item}
                             </div>
                          ))}
                       </div>
                    )}

                    {!validation.ok && validation.issues.length > 0 && (
                       <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-mkt-accent">Feedbacks</span>
                          {validation.issues.slice(0, 2).map((issue, i) => (
                             <div key={i} className="text-[9px] font-bold text-mkt-primary/60 italic leading-relaxed">
                                "{issue.message}"
                             </div>
                          ))}
                       </div>
                    )}

                    {validation.ok && (
                       <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px]">
                          <CheckCircle2 size={14} />
                          <span>APTIDÃO CONFIRMADA</span>
                       </div>
                    )}
                 </GlassCard>
              )}

              <div className="px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 mb-3">Histórico Local</h3>
                 <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                    {auditEntries.slice(0, 3).map((entry) => (
                       <div key={entry.id} className="p-3 rounded-xl bg-white/20 border border-mkt-primary/5 space-y-1">
                          <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-mkt-primary/30">
                             <span>{entry.action_code.split('.')[1]}</span>
                             <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[9px] font-bold text-mkt-primary/60 line-clamp-1 italic">
                             {JSON.stringify(entry.payload)}
                          </p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </aside>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-3xl flex items-center gap-3 shadow-2xl ${
               error ? 'bg-red-500 text-white' : 'bg-mkt-dark text-white border border-mkt-accent/20'
            }`}
          >
             {error ? <AlertCircle size={20} /> : <CheckCircle2 className="text-mkt-accent" size={20} />}
             <span className="text-xs font-black tracking-widest uppercase">{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
