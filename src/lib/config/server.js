// server-side supabase client (use SERVICE ROLE)
import { createClient } from '@supabase/supabase-js';


const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.GEMENI_SUPABASE_SERVICE_ROLE_KEY;


if (!url || !serviceKey) {
  throw new Error('Missing Supabase server env variables');
}


export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false },
});





