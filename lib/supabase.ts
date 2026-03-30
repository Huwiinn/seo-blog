import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function createSupabaseClient(url: string, key: string): SupabaseClient {
  if (!url || !key) {
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error(
          "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and the appropriate key environment variables."
        );
      },
    });
  }
  return createClient(url, key);
}

// 클라이언트 컴포넌트용 (anon key)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// 서버 전용 (service_role key) — Server Action, API Route에서만 사용
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
