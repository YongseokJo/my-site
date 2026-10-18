import { env } from "cloudflare:workers";
import type { MetaStore } from "./meta-store";

export type MetaProvider = "instagram" | "threads";
const ORIGIN = "https://yongseokjo.com";
const APP_IDS: Record<MetaProvider, string> = {
  instagram: "1457143366366244",
  threads: "1602724647751193",
};
const NO_STORE = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;

type Bindings = {
  META_STORE?: DurableObjectNamespace<MetaStore>;
  INSTAGRAM_APP_SECRET?: string;
  THREADS_APP_SECRET?: string;
};
const bindings = () => env as unknown as Bindings;
const store = () => {
  const binding = bindings().META_STORE;
  if (!binding) throw new Error("Meta storage unavailable");
  return binding.get(binding.idFromName("readea-meta"));
};
const secret = (provider: MetaProvider) => provider === "instagram"
  ? bindings().INSTAGRAM_APP_SECRET : bindings().THREADS_APP_SECRET;
const redirectURI = (provider: MetaProvider) => `${ORIGIN}/readea/${provider}/callback`;
const completeURI = (provider: MetaProvider) => `${ORIGIN}/readea/${provider}/complete`;

function randomToken(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function hash(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function json(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...NO_STORE, "Content-Type": "application/json; charset=utf-8" },
  });
}
function done(provider: MetaProvider, appState: string, error?: string, ticket?: string): Response {
  const url = new URL(completeURI(provider));
  url.searchParams.set("app_state", appState);
  if (error) url.searchParams.set("error", error);
  if (ticket) url.searchParams.set("ticket", ticket);
  return new Response(null, { status: 302, headers: { ...NO_STORE, Location: url.href } });
}
function bearer(request: Request): string | null {
  const match = /^Bearer ([A-Za-z0-9_-]{32,128})$/.exec(request.headers.get("Authorization") ?? "");
  return match?.[1] ?? null;
}
async function body(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) return null;
  if (Number(request.headers.get("Content-Length")) > 2048) return null;
  const text = await request.text();
  if (text.length > 2048) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown> : null;
  } catch { return null; }
}
export async function safeRoute(handler: (request: Request) => Promise<Response>, request: Request): Promise<Response> {
  try { return await handler(request); }
  catch { return json({ error: "Meta connection is temporarily unavailable" }, 503); }
}

export async function start(provider: MetaProvider, request: Request): Promise<Response> {
  const appState = new URL(request.url).searchParams.get("app_state") ?? "";
  if (!UUID.test(appState)) return json({ error: "Invalid app state" }, 400);
  if (!secret(provider)) return json({ error: `${provider} is not configured` }, 503);
  const ipHash = await hash(request.headers.get("CF-Connecting-IP") ?? "unknown");
  if (!await store().rateLimit(`start:${provider}:${ipHash}`, 20, 600_000, Date.now()))
    return json({ error: "Too many sign-in attempts" }, 429);
  const state = randomToken();
  await store().putState(await hash(state), provider, appState, Date.now() + 5 * 60_000);
  const url = new URL(provider === "instagram"
    ? "https://www.instagram.com/oauth/authorize"
    : "https://threads.net/oauth/authorize");
  url.searchParams.set("client_id", APP_IDS[provider]);
  url.searchParams.set("redirect_uri", redirectURI(provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider === "instagram"
    ? "instagram_business_basic,instagram_business_content_publish"
    : "threads_basic,threads_content_publish");
  url.searchParams.set("state", state);
  return new Response(null, { status: 302, headers: { ...NO_STORE, Location: url.href } });
}

export async function callback(provider: MetaProvider, request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams;
  const state = query.get("state") ?? "";
  if (!TOKEN.test(state)) return done(provider, "", "invalid_state");
  const appState = await store().consumeState(await hash(state), provider, Date.now());
  if (!appState) return done(provider, "", "invalid_state");
  if (query.has("error")) return done(provider, appState, "authorization_denied");
  const code = query.get("code") ?? "";
  if (!code || code.length > 4096) return done(provider, appState, "invalid_code");
  const clientSecret = secret(provider);
  if (!clientSecret) return done(provider, appState, "not_configured");

  try {
    const params = new URLSearchParams({
      client_id: APP_IDS[provider], client_secret: clientSecret,
      grant_type: "authorization_code", redirect_uri: redirectURI(provider), code,
    });
    const exchange = await fetch(provider === "instagram"
      ? "https://api.instagram.com/oauth/access_token"
      : "https://graph.threads.net/oauth/access_token", {
        method: "POST", body: params, redirect: "manual", signal: AbortSignal.timeout(15_000),
      });
    if (!exchange.ok) return done(provider, appState, "token_exchange_failed");
    const result = await exchange.json() as Record<string, unknown>;
    if (typeof result.access_token !== "string" || !result.access_token)
      return done(provider, appState, "token_exchange_failed");
    const graph = provider === "instagram" ? "https://graph.instagram.com" : "https://graph.threads.net";
    const longURL = new URL(`${graph}/access_token`);
    longURL.searchParams.set("grant_type", provider === "instagram" ? "ig_exchange_token" : "th_exchange_token");
    longURL.searchParams.set("client_secret", clientSecret);
    longURL.searchParams.set("access_token", result.access_token);
    const longResponse = await fetch(longURL, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
    if (!longResponse.ok) return done(provider, appState, "long_lived_token_failed");
    const longToken = await longResponse.json() as Record<string, unknown>;
    if (typeof longToken.access_token !== "string" || typeof longToken.expires_in !== "number"
        || longToken.expires_in <= 0) return done(provider, appState, "long_lived_token_failed");
    const profile = await fetch(`${graph}/me?fields=id,username`, {
      headers: { Authorization: `Bearer ${longToken.access_token}` },
      redirect: "manual", signal: AbortSignal.timeout(15_000),
    });
    if (!profile.ok) return done(provider, appState, "profile_failed");
    const identity = await profile.json() as Record<string, unknown>;
    if (typeof identity.id !== "string" || !/^\d+$/.test(identity.id)
        || typeof identity.username !== "string" || identity.username.length > 100)
      return done(provider, appState, "profile_failed");
    const ticket = randomToken();
    const now = Date.now();
    await store().putTicket(await hash(ticket), provider, identity.id, identity.username,
      longToken.access_token, now + longToken.expires_in * 1000 - 30_000, now + 2 * 60_000);
    return done(provider, appState, undefined, ticket);
  } catch { return done(provider, appState, "provider_unavailable"); }
}

export async function redeem(provider: MetaProvider, request: Request): Promise<Response> {
  const ipHash = await hash(request.headers.get("CF-Connecting-IP") ?? "unknown");
  if (!await store().rateLimit(`redeem:${provider}:${ipHash}`, 30, 600_000, Date.now()))
    return json({ error: "Too many requests" }, 429);
  const payload = await body(request);
  const ticket = payload?.ticket;
  if (typeof ticket !== "string" || !TOKEN.test(ticket)) return json({ error: "Invalid ticket" }, 400);
  const sessionToken = randomToken();
  const account = await store().redeemTicket(await hash(ticket), await hash(sessionToken), provider, Date.now());
  return account
    ? json({ session_token: sessionToken, account_id: account.id, name: account.name,
        expires_at: account.expiresAt })
    : json({ error: "Ticket expired" }, 401);
}

export async function disconnect(provider: MetaProvider, request: Request): Promise<Response> {
  const token = bearer(request);
  if (!token) return json({ error: "Not connected" }, 401);
  await store().deleteSession(await hash(token), provider);
  return json({ disconnected: true });
}

export async function postThread(request: Request): Promise<Response> {
  const sessionToken = bearer(request);
  if (!sessionToken) return json({ error: "Not connected" }, 401);
  const sessionHash = await hash(sessionToken);
  const account = await store().getSession(sessionHash, "threads", Date.now());
  if (!account) return json({ error: "Threads connection expired" }, 401);
  if (!await store().rateLimit(`post:threads:${sessionHash}`, 10, 600_000, Date.now()))
    return json({ error: "Too many posts" }, 429);
  const payload = await body(request);
  const text = payload?.text;
  if (typeof text !== "string" || !text.trim() || text.length > 500
      || [...text].some((c) => c.charCodeAt(0) < 32 && c !== "\n" && c !== "\t"))
    return json({ error: "Threads post must be 1–500 characters" }, 400);
  const creation = await fetch("https://graph.threads.net/me/threads", {
    method: "POST", headers: { Authorization: `Bearer ${account.token}`,
      "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ media_type: "TEXT", text }),
    redirect: "manual", signal: AbortSignal.timeout(15_000),
  });
  if (!creation.ok) return json({ error: "Threads rejected this post" }, 502);
  const created = await creation.json() as Record<string, unknown>;
  if (typeof created.id !== "string" || !/^\d+$/.test(created.id))
    return json({ error: "Threads did not return a post ID" }, 502);
  const published = await fetch("https://graph.threads.net/me/threads_publish", {
    method: "POST", headers: { Authorization: `Bearer ${account.token}`,
      "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: created.id }),
    redirect: "manual", signal: AbortSignal.timeout(15_000),
  });
  if (!published.ok) return json({ error: "Threads could not publish this post" }, 502);
  const result = await published.json() as Record<string, unknown>;
  return typeof result.id === "string"
    ? json({ post_id: result.id })
    : json({ error: "Threads did not confirm publication" }, 502);
}

export function complete(provider: MetaProvider, request: Request): Response {
  const success = new URL(request.url).searchParams.has("ticket");
  const message = success
    ? `Return to READEA to finish connecting ${provider}.`
    : `${provider} connection did not complete. Return to READEA and try again.`;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>READEA connection</title></head><body><p>${message}</p></body></html>`, {
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  });
}
