"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { GlassCard, GlassTopbar, StageStepper, StageStep } from "@ideal/ui";
import { LayoutDashboard, LogOut, Settings, Briefcase, Activity, CheckCircle2, Clock, Zap, TrendingUp, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "authenticated" | "unauthenticated">(
    "checking"
  );
  const [userEmail, setUserEmail] = useState<string>("");

  const demoStages: StageStep[] = [
    { stage: "I", label: "Imersao", status: "in_progress" },
    { stage: "D", label: "Diagnostico", status: "not_started" },
    { stage: "E", label: "Estrutura", status: "not_started" },
    { stage: "A", label: "Arquitetura", status: "not_started" },
    { stage: "L", label: "Loop", status: "not_started" },
  ];

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        setSessionStatus("unauthenticated");
        return;
      }
      setUserEmail(session.user.email ?? "");
      setSessionStatus("authenticated");
    });
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (sessionStatus === "checking") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F2F4F3]">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-mkt-accent border-t-transparent rounded-full animate-spin" />
           <span className="text-xs font-black text-mkt-primary uppercase tracking-[0.2em] animate-pulse">Autenticando Hub...</span>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6 bg-[#F2F4F3]">
        <GlassCard className="max-w-md w-full text-center space-y-8 !p-12">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
             <Activity size={40} />
          </div>
          <div>
             <h1 className="text-2xl font-black text-mkt-dark uppercase tracking-tight mb-2 italic">Acesso Expirado</h1>
             <p className="text-sm font-bold text-mkt-primary/60 leading-relaxed">
               Sua sessao de consultoria expirou. Reconecte-se para manter o fluxo de alta performance.
             </p>
          </div>
          <Link href="/login" className="block w-full">
            <button className="mkt-button-premium w-full shadow-xl">Reconectar Agora</button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col">
      <GlassTopbar>
        <div className="flex items-center gap-6">
          <Image src="/brand/logo-primary.png" alt="MKT Real" width={140} height={32} priority className="opacity-90" />
          <div className="hidden md:block h-8 w-[1px] bg-mkt-primary/10" />
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 leading-none mb-1">Elite Architecture</span>
            <span className="text-sm font-black text-mkt-dark tracking-tight italic uppercase">Maison Projects</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-mkt-primary/40">Sessão Ativa</span>
              <span className="text-sm font-black text-mkt-dark lowercase tracking-tight">{userEmail.split('@')[0]}</span>
           </div>
           <button 
             onClick={handleLogout}
             className="p-3 rounded-2xl bg-mkt-dark text-white hover:bg-black transition-all hover:scale-105 shadow-[0_10px_20px_rgba(34,34,32,0.2)]"
           >
             <LogOut size={18} />
           </button>
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1500px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <section className="lg:col-span-8 space-y-10">
          <header>
             <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-4xl font-black text-mkt-dark tracking-tighter uppercase italic">Dashboard</h2>
                   <p className="text-sm font-bold text-mkt-primary/60 tracking-tight mt-1">Orquestracao Metodologica Global</p>
                </div>
                <Link href="/projects">
                   <button className="px-6 py-3 rounded-2xl bg-white border-2 border-mkt-primary/5 font-black text-[10px] uppercase tracking-widest text-mkt-primary hover:bg-white hover:border-mkt-accent hover:text-mkt-accent transition-all hover:-translate-y-1 shadow-sm active:translate-y-0">
                     Gerenciar Carteira
                   </button>
                </Link>
             </div>
          </header>

          <GlassCard className="!p-10 !rounded-[2.5rem] relative overflow-hidden group">
             {/* Abstract background element */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-mkt-accent/5 rounded-full blur-[80px] group-hover:bg-mkt-accent/10 transition-all duration-700" />
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-mkt-accent/10 text-mkt-accent">
                         <Layers size={24} />
                      </div>
                      <h3 className="text-xl font-black text-mkt-dark tracking-tight uppercase italic underline decoration-mkt-accent/40 decoration-4 underline-offset-8">Metodologia Pipeline</h3>
                   </div>
                   <div className="hidden sm:block px-4 py-2 rounded-full bg-white/40 border border-mkt-primary/5 text-[9px] font-black uppercase tracking-widest text-mkt-primary/40">
                      V2.4 Stable
                   </div>
                </div>
                
                <div className="py-4">
                   <StageStepper stages={demoStages} />
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2rem] bg-white border border-mkt-primary/5 group/card transition-all hover:bg-mkt-accent/5 hover:border-mkt-accent/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-mkt-accent flex items-center justify-center text-mkt-dark shadow-[0_5px_15px_rgba(234,184,23,0.3)]">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <span className="font-black text-mkt-dark uppercase tracking-tight italic">Proximo Passo</span>
                    </div>
                    <p className="text-xs font-bold text-mkt-primary/60 leading-relaxed mb-6">Inicie a etapa de Imersão nos novos projetos para sincronizar o centro de custo.</p>
                    <Link href="/projects">
                      <button className="flex items-center gap-2 group/btn">
                         <span className="text-[10px] font-black text-mkt-accent uppercase tracking-widest group-hover/btn:underline">Ir para Tarefas</span>
                         <TrendingUp size={14} className="text-mkt-accent transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="p-8 rounded-[2rem] bg-mkt-dark border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="font-black text-white uppercase tracking-tight italic">Performance</span>
                    </div>
                    <p className="text-xs font-bold text-white/40 leading-relaxed mb-6">Voce possui 2 projetos ativos com entregas pendentes esta semana.</p>
                    <button className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest hover:underline">Auditoria Total</span>
                       <Briefcase size={14} className="text-white/40" />
                    </button>
                  </div>
                </div>
             </div>
          </GlassCard>
        </section>

        {/* Shortcuts */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40 px-2 italic">Acesso Restrito</h3>
             <GlassCard className="!p-8 !rounded-[2.5rem] bg-white border-2 border-white shadow-2xl">
               <div className="grid gap-4">
                 {[
                   { label: "Gestao de Projetos", href: "/projects", icon: Briefcase, color: "text-mkt-accent" },
                   { label: "Configuracoes", href: "/settings", icon: Settings, color: "text-mkt-primary/40" },
                   { label: "Ajuda & Suporte", href: "/", icon: Activity, color: "text-mkt-primary/40" },
                 ].map((link) => (
                   <Link key={link.label} href={link.href}>
                     <div className="group flex items-center gap-5 p-5 rounded-2xl bg-mkt-primary/5 hover:bg-mkt-dark hover:scale-[1.02] transition-all cursor-pointer">
                       <link.icon size={22} className={`${link.color} group-hover:text-white transition-colors`} />
                       <span className="text-sm font-black tracking-tight text-mkt-dark group-hover:text-white transition-colors lowercase italic">{link.label}</span>
                     </div>
                   </Link>
                 ))}
               </div>
             </GlassCard>
          </div>

          <div className="p-4 flex flex-col items-center gap-4">
             <div className="px-6 py-2 rounded-full border border-mkt-primary/10 text-[9px] font-black uppercase tracking-[0.3em] text-mkt-primary/20 bg-white/40">
                IDEAL Liquid 2.0
             </div>
             <p className="text-[8px] font-bold text-mkt-primary/40 text-center uppercase tracking-widest max-w-[180px] leading-relaxed">
                Desenvolvimento de Elite por MKT Real Architecture
             </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

