import { createClient } from "@supabase/supabase-js";

// Debug: verificar se as variáveis de ambiente estão sendo carregadas
console.log("VITE_SUPA_PROJECT_URL:", import.meta.env.VITE_SUPA_PROJECT_URL);
console.log("VITE_ANON_KEY:", import.meta.env.VITE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPA_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase configuration missing:", {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
