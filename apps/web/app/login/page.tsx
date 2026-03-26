"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { GlassCard } from "@ideal/ui"; // Assuming it's exported from index.ts
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("tecnologia@mktreal.com.br");
  const [password, setPassword] = useState("123!mudar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/");
        return;
      }
      setCheckingSession(false);
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    setLoading(false);
    router.push("/");
  }

  if (checkingSession) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-mkt-light">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <ShieldCheck size={48} className="text-mkt-accent" />
          <span className="font-bold text-mkt-primary tracking-widest uppercase text-sm">Validando Acesso</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-screen flex items-center justify-center p-6 bg-[#F2F4F3] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mkt-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mkt-primary/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10"
      >
        <GlassCard className="!bg-[rgba(34,34,32,0.85)] !p-10 border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Image src="/brand/logo-monochrome.png" alt="MKT Real" width={280} height={80} priority className="mb-6" />
            </motion.div>
            <h1 className="text-white text-3xl font-black mb-2 text-center">Sistema IDEAL</h1>
            <p className="text-white/60 text-sm text-center font-medium">
              Gestao da metodologia de consultoria MKT Real
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-mkt-accent focus:border-transparent transition-all outline-none"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-mkt-accent focus:border-transparent transition-all outline-none"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              className="w-full py-4 rounded-2xl bg-mkt-accent text-mkt-dark font-black uppercase tracking-widest text-sm hover:bg-mkt-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(234,184,23,0.3)]"
              type="submit"
              disabled={loading}
            >
              {loading ? "Autenticando..." : "Acessar Plataforma"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">
              Powered by MKT Real Methodology
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  );
}

