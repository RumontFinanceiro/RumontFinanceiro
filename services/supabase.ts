
import { createClient } from '@supabase/supabase-js';

/**
 * Configuração de variáveis de ambiente para Vite/Cloudflare Pages.
 * No painel do Cloudflare, adicione:
 * VITE_SUPABASE_URL
 * VITE_SUPABASE_ANON_KEY
 */
// Use process.env to access environment variables and resolve TypeScript type errors on ImportMeta
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mtdolhpdahfrvxefdfic.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tPvEDx4S_W7rzVE_2krgHQ_jD7StY-X';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
