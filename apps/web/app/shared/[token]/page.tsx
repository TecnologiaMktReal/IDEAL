"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getApiBaseUrl } from "../../../lib/api";
import { GlassCard, GlassTopbar } from "@ideal/ui";
import { CheckCircle2, AlertCircle, FileText, ChevronRight, Lock, Printer, ExternalLink } from "lucide-react";

type ClientArtifact = {
  stage: string;
  code: string;
  name: string;
  sections: Array<{
    code: string;
    title: string;
    description: string;
    fields: Array<{
      code: string;
      label: string;
      type: string;
    }>;
  }>;
  answers: Record<string, unknown>;
  computed_json: Record<string, unknown>;
};

export default function SharedClientPortal() {
  const params = useParams<{ token: string }>();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{ name: string; created_at: string } | null>(null);
  const [artifacts, setArtifacts] = useState<ClientArtifact[]>([]);

  useEffect(() => {
    if (!params?.token) return;
    
    fetch(`${apiBaseUrl}/m1/shared/${params.token}`)
      .then(res => res.json())
      .then(payload => {
        if (!payload.ok) {
          setError(payload.message || "Acesso negado.");
          setLoading(false);
          return;
        }
        setProject(payload.project);
        setArtifacts(payload.clientArtifacts || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro na conexão segura.");
        setLoading(false);
      });
  }, [params?.token, apiBaseUrl]);

  if (loading) {
     return (
        <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-mkt-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-black text-mkt-primary uppercase tracking-widest">Descriptografando Link Seguro...</span>
         </div>
       </div>
     );
  }

  if (error) {
     return (
        <div className="min-h-screen bg-[#F2F4F3] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertCircle size={48} />
            <span className="text-sm font-black uppercase tracking-widest font-mono">ACESSO REJEITADO</span>
            <span className="text-xs font-bold text-mkt-primary/60">{error}</span>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col font-sans">
      <GlassTopbar>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-mkt-dark text-mkt-accent shadow-lg shadow-black/10">
             <Lock size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-mkt-dark tracking-tight uppercase">Portal Executivo</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mkt-primary/60 italic">Metodologia Exclusiva MKT Real</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="mkt-button-premium !py-2.5 !bg-mkt-primary !from-mkt-primary !to-mkt-dark flex items-center gap-2 no-print"
          >
            <Printer size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">Exportar Dossiê PDF</span>
          </button>
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto space-y-12 pb-24 h-full">
         <div className="text-center space-y-4 mb-16 pt-8">
            <div className="inline-block px-4 py-1 rounded-full border border-mkt-accent/20 bg-mkt-accent/5 text-[10px] items-center text-mkt-accent font-black uppercase tracking-[0.2em] mb-4">
               Acesso B2B Concedido
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-mkt-dark tracking-tighter uppercase leading-none">
               {project?.name}
            </h2>
            <p className="text-sm font-bold text-mkt-primary/40 uppercase tracking-[0.1em]">
               Relatórios e Diagnósticos Consolidados
            </p>
         </div>

         {artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-mkt-primary/30 border-2 border-dashed border-mkt-primary/10 rounded-3xl">
               <FileText size={48} className="mb-4 opacity-50" />
               <span className="text-sm font-black uppercase tracking-[0.2em]">Nenhum Relatório Público</span>
               <p className="text-xs font-bold mt-2 max-w-sm">A equipe da MKT Real ainda não finalizou ou publicou as versões finais "Client-Ready" desta metodologia.</p>
            </div>
         ) : (
            artifacts.map((artifact) => (
               <GlassCard key={artifact.code} className="!p-8 md:!p-12 space-y-10 shadow-2xl shadow-mkt-primary/5 border-t-8 border-mkt-dark">
                  <div className="border-b border-mkt-primary/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest bg-mkt-primary/5 text-mkt-primary px-3 py-1 rounded-full">
                              Etapa {artifact.stage}
                           </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-mkt-dark tracking-tight uppercase italic">{artifact.name}</h3>
                     </div>
                  </div>

                  <div className="space-y-10">
                     {artifact.sections.map((section) => (
                        <div key={section.code} className="space-y-6">
                           <h4 className="text-lg font-black text-mkt-primary tracking-tight uppercase flex items-center gap-3">
                              <span className="w-1.5 h-6 bg-mkt-accent rounded-full inline-block" />
                              {section.title}
                           </h4>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
                              {section.fields.map((field) => {
                                 const value = artifact.answers[field.code];
                                 const isFile = field.type === "file";
                                 const isFilled = value !== undefined && value !== null && value !== "";
                                 
                                 return (
                                    <div key={field.code} className="bg-white/40 p-5 rounded-2xl border border-mkt-primary/5 hover:bg-white hover:shadow-lg hover:shadow-mkt-primary/5 transition-all">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/40 block mb-2">{field.label}</span>
                                       
                                       {!isFilled ? (
                                          <span className="text-xs font-bold italic text-mkt-primary/20">- Sem observações -</span>
                                       ) : isFile ? (
                                          <div className="mt-2">
                                             <a href={value as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-mkt-primary/5 text-mkt-primary rounded-lg text-xs font-black uppercase hover:bg-mkt-primary/10 transition-colors shrink-0 max-w-full">
                                                <FileText size={14} className="shrink-0" />
                                                <span className="truncate block">Visualizar Anexo</span>
                                                <ExternalLink size={12} className="opacity-50 shrink-0" />
                                             </a>
                                          </div>
                                       ) : typeof value === "object" ? (
                                          <pre className="text-[10px] font-bold text-mkt-dark/70 bg-white p-3 rounded-lg overflow-x-auto border border-mkt-primary/5">
                                             {JSON.stringify(value, null, 2)}
                                          </pre>
                                       ) : (
                                          <p className="text-sm font-bold text-mkt-dark whitespace-pre-wrap leading-relaxed">
                                             {String(value)}
                                          </p>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>

                  {Object.keys(artifact.computed_json).length > 0 && (
                     <div className="mt-12 bg-mkt-dark text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-mkt-accent/20 blur-[100px] rounded-full pointer-events-none" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-mkt-accent mb-6 flex items-center gap-2 relative z-10">
                           <CheckCircle2 size={16} />
                           Resultado Estratégico & Maturidade
                        </h4>
                        <pre className="text-xs font-mono font-bold text-white/80 whitespace-pre-wrap relative z-10 opacity-90 max-w-full overflow-x-auto">
                           {JSON.stringify(artifact.computed_json, null, 2)}
                        </pre>
                     </div>
                  )}
               </GlassCard>
            ))
         )}
      </main>
    </div>
  );
}
