import { createClient } from '@supabase/supabase-js';

// This file must only be imported from server-side code.
// It uses the service role key which bypasses RLS. NEVER expose this to the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase env vars: ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
