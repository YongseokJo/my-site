export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const displayName = formData.get("display_name")?.toString();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabaseServerClient(request, cookies);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || "" },
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Profile auto-created by DB trigger. Account unapproved until admin sets approved=true.
  return new Response(JSON.stringify({ message: "Check your email for verification link" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
