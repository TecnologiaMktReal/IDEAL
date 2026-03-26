"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../../../../lib/api";
import { getSupabaseBrowserClient } from "../../../../lib/supabase/client";
import { GlassCard, GlassTopbar, StageStepper } from "@ideal/ui";
import { 
  ArrowLeft, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Layers,
  Search,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StageCode = "I" | "D" | "E" | "A" | "L";

type StagePayload = {
  stage: StageCode;
  progress: number;
  status: "not_started" | "in_progress" | "ready_for_completion" | "completed" | "reopened";
  artifacts: Array<{
    code: string;
    name: string;
    description: string;
    visibility: "internal" | "client";
    state: {
      status: string;
      completion_ratio: number;
    };
  }>;
};

const STAGE_LABEL: Record<StageCode, string> = {
  I: "Imersao",
  D: "Diagnostico",
  E: "Estrutura",
  A: "Arquitetura",
  L: "Loop"
};

const STAGE_SEQUENCE: StageCode[] = ["I", "D", "E", "A", "L"];

export default function ProjectMethodologyPage() {
  const params = useParams<{ projectId: string }>();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<StagePayload[]>([]);
  const [sharing, setSharing] = useState(false);

  async function generateShareLink() {
    if (!params?.projectId) return;
    setSharing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/share`, { method: "POST" });
      const payload = await res.json();
      if (payload.ok) {
        const fullUrl = `${window.location.origin}${payload.shareUrl}`;
        await navigator.clipboard.writeText(fullUrl);
        alert("Link Mágico B2B Criad e Copiado! Envie este link seguro ao seu cliente.");
      } else {
        alert(payload.message || "Erro ao gerar link da matriz.");
      }
    } catch {
      alert("Erro na rede. O Motor JWT não pôde ser ativado.");
    }
    setSharing(false);
  }

  useEffect(() => {
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
      const responses = await Promise.all(
        STAGE_SEQUENCE.map((stage) => fetch(`${apiBaseUrl}/m1/projects/${params.projectId}/methodology/${stage}`))
      );
      const payloads = await Promise.all(responses.map((response) => response.json()));
      const firstError = payloads.find((payload) => !payload.ok);
      if (firstError) {
        setError(firstError.message || "Falha ao carregar etapas metodologicas.");
        setLoading(false);
        return;
      }
      setStages(payloads as StagePayload[]);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
    setLoading(false);
  }

  const stepperStages = stages.map(s => ({
    stage: s.stage,
    label: STAGE_LABEL[s.stage],
    status: s.status || (s.progress === 100 ? 'completed' : s.progress > 0 ? 'in_progress' : 'not_started')
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-mkt-accent border-t-transparent rounded-full animate-spin" />
           <span className="text-sm font-black text-mkt-primary uppercase tracking-widest">Iniciando Pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col">
      <GlassTopbar>
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.projectId}`}>
            <button className="p-2.5 rounded-xl hover:bg-mkt-primary/10 transition-colors text-mkt-primary">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-mkt-dark tracking-tight uppercase">Execucao IDEAL</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mkt-primary/60">Pipeline de Alta Performance</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={generateShareLink}
            disabled={sharing}
            className="mkt-button-premium !py-2.5 !bg-mkt-dark !from-mkt-dark !to-mkt-primary flex items-center gap-2"
          >
            {sharing ? <Clock size={18} className="animate-spin" /> : <Share2 size={18} className="text-mkt-accent" />}
            <span className="text-[11px] font-black uppercase tracking-widest text-mkt-accent">Compartilhar com Cliente</span>
          </button>
          
          <button 
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/40 border border-mkt-primary/10 text-mkt-primary hover:bg-white/60 transition-all"
          >
            <Clock size={20} />
          </button>
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto space-y-12">
        {/* Progress Tracker */}
        <section className="space-y-6">
           <div className="flex justify-between items-end px-2">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 mb-1">Status Global</h3>
                <p className="text-lg font-black text-mkt-dark italic">Jornada de Maturidade</p>
              </div>
           </div>
           <GlassCard className="!p-10">
              <StageStepper stages={stepperStages} />
           </GlassCard>
        </section>

        {/* Stage Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {stages.map((stage, idx) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="group h-full flex flex-col hover:border-mkt-accent/40 transition-all duration-500">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-mkt-primary/40 uppercase tracking-[0.2em]">Etapa {idx + 1}</span>
                       <h4 className="text-2xl font-black text-mkt-dark tracking-tight">{STAGE_LABEL[stage.stage]}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-mkt-primary/5 flex items-center justify-center text-mkt-primary/20 font-black text-xl italic group-hover:bg-mkt-accent group-hover:text-mkt-dark transition-all duration-500">
                       {stage.stage}
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-mkt-primary/60">Progresso Atual</span>
                           <span className="text-mkt-accent">{stage.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-mkt-primary/5 rounded-full overflow-hidden border border-mkt-primary/5">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stage.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-mkt-primary to-mkt-accent rounded-full shadow-[0_0_10px_rgba(234,184,23,0.3)]"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-mkt-primary/5 border border-mkt-primary/5">
                           <FileText size={16} className="text-mkt-primary/40 mb-2" />
                           <div className="text-lg font-black text-mkt-dark">{stage.artifacts.length}</div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-mkt-primary/40">Artefatos</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-mkt-primary/5 border border-mkt-primary/5">
                           <CheckCircle2 size={16} className="text-emerald-500/40 mb-2" />
                           <div className="text-lg font-black text-mkt-dark">
                              {stage.artifacts.filter(a => a.state.status === 'completed').length}
                           </div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-mkt-primary/40">Concluidos</div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8">
                     <Link href={`/projects/${params.projectId}/methodology/${stage.stage}`}>
                        <button className="mkt-button-premium w-full flex items-center justify-center gap-2 group-hover:shadow-xl transition-all">
                           <span>Abrir Etapa</span>
                           <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {error && (
           <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-4 text-red-600">
              <AlertCircle size={24} />
              <p className="text-sm font-bold tracking-tight">{error}</p>
           </div>
        )}
      </main>
    </div>
  );
}
