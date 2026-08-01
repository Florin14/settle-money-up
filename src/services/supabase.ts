import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// NOTE: base project URL only — the client appends /rest/v1, /auth/v1 etc. itself.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gyzrjgupuyamgyxajzzs.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5enJqZ3VwdXlhbWd5eGFqenpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDMwNDgsImV4cCI6MjEwMTE3OTA0OH0.bBRspCcbp7mrKa48ezTtsd14XC7CuQ40zZBwxXgRrUE";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
