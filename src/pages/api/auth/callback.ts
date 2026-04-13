export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = createSupabaseServerClient(request, cookies);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after email verification
  return redirect("/");
};
