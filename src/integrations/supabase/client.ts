// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("Erro: A variável de ambiente VITE_SUPABASE_URL não está definida.");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Erro: A variável de ambiente VITE_SUPABASE_ANON_KEY não está definida.");
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Utilitário para obter a URL da Edge Function
export function getSupabaseFunctionUrl(functionName: string) {
  // Tente usar variável de ambiente (ideal para dev/local)
  const envUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/${functionName}`;
  }
  // Fallback para cloud (project_id fixo do projeto)
  return `https://hjwebmpvaaeogbfqxwub.functions.supabase.co/${functionName}`;
}