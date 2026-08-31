/**
 * supabase.ts
 * 
 * PROPÓSITO:
 * Configurar e prover a instância única (Singleton) do cliente oficial do Supabase.
 * 
 * RESPONSABILIDADES:
 * - Ler as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
 * - Retornar nulo (null) graciosamente caso as chaves não existam, o que avisa 
 *   o `storage.ts` para usar o modo offline (LocalStorage).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, anonKey?: string): SupabaseClient | null => {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('terraforte_supabase_url') || '';
  const finalKey = anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('terraforte_supabase_anon_key') || '';

  if (!finalUrl || !finalKey) {
    return null;
  }

  try {
    if (!supabaseClient) {
      supabaseClient = createClient(finalUrl, finalKey);
    }
    return supabaseClient;
  } catch (error) {
    console.error('Erro ao inicializar cliente Supabase:', error);
    return null;
  }
};

export const resetSupabaseClient = (url: string, key: string): SupabaseClient | null => {
  if (!url || !key) {
    supabaseClient = null;
    return null;
  }
  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (error) {
    console.error('Erro ao redefinir cliente Supabase:', error);
    return null;
  }
};
