"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../../lib/api";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { GlassCard, GlassTopbar } from "@ideal/ui";
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ProjectItem = {
  id: string;
  client_company_name: string;
  cnpj: string;
  segment: string | null;
  started_at: string | null;
  expected_end_at: string | null;
  created_at: string;
};

type PaginationPayload = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function ProjectsPage() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [sessionReady, setSessionReady] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationPayload>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  const [editForm, setEditForm] = useState({
    clientCompanyName: "",
    cnpj: "",
    segment: "",
    expectedEndAt: ""
  });

  const [form, setForm] = useState({
    clientCompanyName: "",
    cnpj: "",
    segment: "",
    consultantEmail: "consultor@mktreal.com.br",
    expectedEndAt: ""
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      setSessionReady(true);
    });
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    fetchProjects();
  }, [sessionReady, page]);

  async function fetchProjects() {
    setLoadingList(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "10"
    });
    if (query.trim()) params.set("q", query.trim());

    const response = await fetch(`${apiBaseUrl}/m1/projects?${params.toString()}`);
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao carregar projetos.");
      setLoadingList(false);
      return;
    }
    setProjects(payload.projects || []);
    setPagination(
      payload.pagination || {
        page: 1,
        pageSize: 10,
        total: payload.projects?.length || 0,
        totalPages: 1
      }
    );
    setLoadingList(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const response = await fetch(`${apiBaseUrl}/m1/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao criar projeto.");
      return;
    }

    setSuccess(`Projeto ${payload.project.client_company_name} criado com sucesso.`);
    setForm({
      clientCompanyName: "",
      cnpj: "",
      segment: "",
      consultantEmail: "consultor@mktreal.com.br",
      expectedEndAt: ""
    });
    setPage(1);
    fetchProjects();
  }

  function startEdit(project: ProjectItem) {
    setEditingProject(project);
    setEditForm({
      clientCompanyName: project.client_company_name,
      cnpj: project.cnpj,
      segment: project.segment || "",
      expectedEndAt: project.expected_end_at || ""
    });
    setError(null);
    setSuccess(null);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProject) return;
    setSavingEdit(true);
    setError(null);
    setSuccess(null);

    const response = await fetch(`${apiBaseUrl}/m1/projects/${editingProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    const payload = await response.json();
    setSavingEdit(false);

    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao editar projeto.");
      return;
    }

    setSuccess(`Projeto ${payload.project.client_company_name} atualizado com sucesso.`);
    setEditingProject(null);
    fetchProjects();
  }

  async function handleDelete(project: ProjectItem) {
    const confirmed = window.confirm(`Deseja excluir o projeto ${project.client_company_name}?`);
    if (!confirmed) return;
    setDeletingProjectId(project.id);
    setError(null);
    setSuccess(null);

    const response = await fetch(`${apiBaseUrl}/m1/projects/${project.id}`, {
      method: "DELETE"
    });
    const payload = await response.json();
    setDeletingProjectId(null);

    if (!response.ok || !payload.ok) {
      setError(payload.message || "Falha ao excluir projeto.");
      return;
    }

    setSuccess(`Projeto ${project.client_company_name} excluido com sucesso.`);
    if (projects.length === 1 && page > 1) {
      setPage((current) => current - 1);
      return;
    }
    fetchProjects();
  }

  return (
    <div className="min-h-screen bg-[#F2F4F3] flex flex-col">
      <GlassTopbar>
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2.5 rounded-xl hover:bg-mkt-primary/10 transition-colors text-mkt-primary">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-mkt-dark tracking-tight">Gestao de Projetos</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mkt-primary/60">Controle Metodologico M1</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <Image src="/brand/logo-primary.png" alt="MKT Real" width={140} height={34} priority />
        </div>
      </GlassTopbar>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Section */}
        <section className="lg:col-span-4 space-y-6">
          <AnimatePresence mode="wait">
            {!editingProject ? (
              <motion.div
                key="new-project"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="!p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Plus className="text-mkt-accent" size={24} />
                    <h3 className="text-xl font-black text-mkt-dark tracking-tight">Novo Projeto</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-mkt-primary/60 ml-1">Empresa Cliente</label>
                      <input
                        className="mkt-input-premium text-sm font-medium"
                        value={form.clientCompanyName}
                        onChange={(e) => setForm({...form, clientCompanyName: e.target.value})}
                        required
                        placeholder="Nome da empresa..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-mkt-primary/60 ml-1">CNPJ</label>
                      <input
                        className="mkt-input-premium text-sm font-medium"
                        value={form.cnpj}
                        onChange={(e) => setForm({...form, cnpj: e.target.value})}
                        required
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-mkt-primary/60 ml-1">Segmento</label>
                      <input
                        className="mkt-input-premium text-sm font-medium"
                        value={form.segment}
                        onChange={(e) => setForm({...form, segment: e.target.value})}
                        placeholder="Ex: Tecnologia, Varejo..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-mkt-primary/60 ml-1">Previsao Encerramento</label>
                      <input
                        className="mkt-input-premium text-sm font-medium"
                        type="date"
                        value={form.expectedEndAt}
                        onChange={(e) => setForm({...form, expectedEndAt: e.target.value})}
                      />
                    </div>

                    <button 
                      className="mkt-button-premium w-full mt-4 flex items-center justify-center gap-2" 
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? "Processando..." : <><Plus size={18}/> Criar Projeto</>}
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="edit-project"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="!p-8 !bg-mkt-dark !text-white border-none shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Edit3 className="text-mkt-accent" size={24} />
                      <h3 className="text-xl font-black tracking-tight">Editar Projeto</h3>
                    </div>
                    <button onClick={() => setEditingProject(null)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleEditSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Empresa Cliente</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-mkt-accent outline-none text-sm font-medium"
                        value={editForm.clientCompanyName}
                        onChange={(e) => setEditForm({...editForm, clientCompanyName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">CNPJ</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-mkt-accent outline-none text-sm font-medium"
                        value={editForm.cnpj}
                        onChange={(e) => setEditForm({...editForm, cnpj: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Segmento</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-mkt-accent outline-none text-sm font-medium"
                        value={editForm.segment}
                        onChange={(e) => setEditForm({...editForm, segment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Previsao Encerramento</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-mkt-accent outline-none text-sm font-medium"
                        type="date"
                        value={editForm.expectedEndAt}
                        onChange={(e) => setEditForm({...editForm, expectedEndAt: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-3 mt-4">
                       <button 
                        className="mkt-button-premium flex-1" 
                        disabled={savingEdit}
                        type="submit"
                      >
                        {savingEdit ? "Salvando..." : "Salvar"}
                      </button>
                       <button 
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex gap-3 items-center shadow-sm">
                <AlertCircle size={20} />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex gap-3 items-center shadow-sm">
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Column: Projects List */}
        <section className="lg:col-span-8 space-y-6">
          <GlassCard className="!p-8 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
               <h3 className="text-xl font-black text-mkt-dark tracking-tight">Projetos Cadastrados</h3>
               <div className="relative w-full md:max-w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mkt-primary/40" size={16} />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mkt-primary/5 border border-mkt-primary/5 focus:ring-2 focus:ring-mkt-accent outline-none text-sm font-medium transition-all"
                    placeholder="Filtrar por nome ou empresa..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
                  />
               </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {loadingList ? (
                Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-mkt-primary/5 animate-pulse" />
                ))
              ) : projects.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Briefcase size={48} className="text-mkt-primary/20 mb-4" />
                  <p className="text-mkt-primary/60 font-medium">Nenhum projeto encontrado.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <motion.div 
                    layout
                    key={project.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/60 border border-mkt-primary/10 hover:border-mkt-accent/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-mkt-primary/5 flex items-center justify-center text-mkt-primary/40 group-hover:bg-mkt-accent/10 group-hover:text-mkt-accent transition-colors">
                         <Building2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-mkt-dark group-hover:text-mkt-accent transition-colors tracking-tight">{project.client_company_name}</h4>
                        <div className="flex items-center gap-3 mt-0.5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-mkt-primary/40">{project.cnpj}</span>
                           <span className="w-1 h-1 bg-mkt-primary/20 rounded-full" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-mkt-accent">{project.segment || "Geral"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <div className="flex flex-col items-end mr-4 hidden sm:flex">
                        <span className="text-[10px] font-bold text-mkt-primary/30 uppercase tracking-widest">Encerramento</span>
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-mkt-primary/40" />
                           <span className="text-xs font-black text-mkt-primary/60">{project.expected_end_at ? new Date(project.expected_end_at).toLocaleDateString() : "-"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/projects/${project.id}/methodology`}>
                          <button className="p-2.5 rounded-xl bg-mkt-dark text-white hover:bg-black transition-all shadow-md active:scale-95" title="Executar Metodologia">
                            <ChevronRight size={18} strokeWidth={3} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => startEdit(project)}
                          className="p-2.5 rounded-xl bg-mkt-primary/10 text-mkt-primary hover:bg-mkt-primary/20 transition-all active:scale-95" title="Editar">
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project)}
                          disabled={deletingProjectId === project.id}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all active:scale-95" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 pt-6 border-t border-mkt-primary/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-mkt-primary/40">
                PAGINA {pagination.page} DE {pagination.totalPages} — TOTAL {pagination.total}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-mkt-primary/5 text-mkt-primary disabled:opacity-30 hover:bg-mkt-primary/10 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg bg-mkt-primary/5 text-mkt-primary disabled:opacity-30 hover:bg-mkt-primary/10 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
}

