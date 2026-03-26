import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://tyneeznaprtomxuhmsti.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bmVlem5hcHJ0b214dWhtc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTQzMzgsImV4cCI6MjA4OTQzMDMzOH0.E8JKkd6P-y0lZ4xSa8Ftm2XRiVLdnOnRx1XGcXTkH-g";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value =
    process.env[name] ??
    (name === "NEXT_PUBLIC_SUPABASE_URL" ? FALLBACK_SUPABASE_URL : FALLBACK_SUPABASE_ANON_KEY);
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}. Configure .env.local e reinicie o Next.js.`);
  }
  return value;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!cachedClient) {
    cachedClient = createSupabaseBrowserClient();
  }
  return cachedClient;
}
