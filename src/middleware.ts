import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip Supabase client creation during static prerendering (no env vars available)
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
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
