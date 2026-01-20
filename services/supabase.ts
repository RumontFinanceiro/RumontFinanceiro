
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mtdolhpdahfrvxefdfic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tPvEDx4S_W7rzVE_2krgHQ_jD7StY-X';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
