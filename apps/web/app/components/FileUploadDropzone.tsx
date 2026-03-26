"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, File as FileIcon, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

interface Props {
  onUploadSuccess: (url: string) => void;
  currentValue?: string;
  projectId: string;
}

export function FileUploadDropzone({ onUploadSuccess, currentValue, projectId }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("evidences")
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
         if (uploadError.message.includes("Bucket not found")) {
            throw new Error("Bucket 'evidences' não existe no Supabase. Crie-o como PUBLIC no dashboard.");
         }
         throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("evidences")
        .getPublicUrl(fileName);

      onUploadSuccess(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload. Verifique as permissões do Storage.");
    } finally {
      setIsUploading(false);
    }
  }

  function onDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  // Se já houver um arquivo, mostramos um card com o link.
  if (currentValue && typeof currentValue === "string" && currentValue.startsWith("http")) {
    return (
      <div className="w-full bg-emerald-50/50 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
             <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800">Evidência Anexada</span>
            <a href={currentValue} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600/70 underline hover:text-emerald-600 truncate max-w-[200px]">
               {currentValue}
            </a>
          </div>
        </div>
        <button 
          onClick={() => onUploadSuccess("")}
          className="p-2 text-mkt-primary/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remover Evidência"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full relative min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
          dragActive 
            ? "border-mkt-accent bg-mkt-accent/5 scale-[1.02]" 
            : error 
              ? "border-red-500/30 bg-red-50" 
              : "border-mkt-primary/20 bg-white/40 hover:border-mkt-accent/50 hover:bg-white/80"
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={(e) => {
             if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
          }}
          accept="image/*,.pdf"
        />

        {isUploading ? (
           <div className="flex flex-col items-center gap-3 animate-pulse text-mkt-accent">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Transmitindo para Storage...</span>
           </div>
        ) : error ? (
           <div className="flex flex-col items-center gap-2 text-red-500/80 text-center">
              <AlertCircle size={32} />
              <span className="text-xs font-black uppercase tracking-widest">Falha no Envio</span>
              <p className="text-[10px] font-bold opacity-80 max-w-xs">{error}</p>
           </div>
        ) : (
           <div className="flex flex-col items-center gap-3 text-mkt-primary/40 group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-hover:text-mkt-accent transition-all duration-300">
                 <UploadCloud size={24} />
              </div>
              <div className="text-center">
                 <span className="text-xs font-black uppercase tracking-widest text-mkt-dark block mb-1 group-hover:text-mkt-accent transition-colors">Arraste ou Clique</span>
                 <p className="text-[10px] font-bold opacity-70">Suporta JPG, PNG ou PDF (Max 10MB)</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
