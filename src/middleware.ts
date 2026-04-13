import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip Supabase client creation during static prerendering (no env vars available)
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    context.locals.user = null;
    return next();
  }

  // Path-based filtering: only create Supabase client for routes that need auth.
  // Static pages (/, /about, /publications, etc.) skip Supabase entirely for performance.
  const authPaths = ["/dashboard", "/software", "/login", "/signup", "/pending-approval", "/api/"];
  const pathname = context.url.pathname;
  const needsAuth = authPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) {
    context.locals.user = null;
    return next();
  }

  const supabase = createSupabaseServerClient(context.request, context.cookies);

  // IMPORTANT: Always call getUser(), not getSession()
  // getUser() validates the JWT server-side; getSession() trusts the cookie blindly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Attach to locals for use in pages/endpoints
  context.locals.supabase = supabase;
  context.locals.user = user;

  return next();
});
