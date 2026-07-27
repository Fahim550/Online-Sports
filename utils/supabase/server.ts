import { Database } from "@/app/types/database";
import { createClient as createBrowserClient } from "./client";

/**
 * Server-side Supabase client for use in Server Components and Route Handlers.
 * For layout.tsx and other RSC contexts where cookies are not needed
 * (public data only), this reuses the browser client's anon key approach.
 * The real benefit here is unstable_cache wrapping the call, not cookie auth.
 */
export function createClient() {
  return createBrowserClient();
}
