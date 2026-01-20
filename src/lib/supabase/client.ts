import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Return cached client if it exists
  if (client) return client;

  // During build/SSR, return a placeholder that will be replaced on client
  if (typeof window === 'undefined') {
    // Return a minimal mock during SSR that won't actually be used
    return {} as SupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
