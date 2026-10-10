import { env } from "cloudflare:workers";
import { paperPostTemplate } from "./paper-share-template";
import type { LinkedInStore } from "./linkedin-store";

const REDIRECT_URI = "https://yongseokjo.com/readea/linkedin/callback";
const COMPLETE_URI = "https://yongseokjo.com/readea/linkedin/complete";
const OAUTH_TTL_MS = 5 * 60_000;
const TICKET_TTL_MS = 2 * 60_000;
const MAX_SESSION_MS = 30 * 24 * 60 * 60_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RANDOM_TOKEN = /^[A-Za-z0-9_-]{32,128}$/;
const NO_STORE = {
	"Cache-Control": "private, no-store",
	"Referrer-Policy": "no-referrer",
};

type Bindings = {
	LINKEDIN_STORE?: DurableObjectNamespace<LinkedInStore>;
	LINKEDIN_CLIENT_ID?: string;
	LINKEDIN_CLIENT_SECRET?: string;
};

function bindings(): Bindings {
	return env as unknown as Bindings;
}

function store(): DurableObjectStub<LinkedInStore> | null {
	const binding = bindings().LINKEDIN_STORE;
	return binding ? binding.get(binding.idFromName("readea-linkedin")) : null;
}

function requireStore(): DurableObjectStub<LinkedInStore> {
	const database = store();
	if (!database) throw new Error("LinkedIn storage binding unavailable");
	return database;
}

function randomToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...bytes))
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");
}

function hasControlCharacter(value: string): boolean {
	return [...value].some((character) => {
		const code = character.charCodeAt(0);
		return code < 32 || code === 127;
	});
}

async function hash(value: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	);
	return [...new Uint8Array(digest)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function json(body: object, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...NO_STORE, "Content-Type": "application/json; charset=utf-8" },
	});
}

function error(message: string, status: number): Response {
	return json({ error: message }, status);
}

export async function jsonRoute(
	handler: (request: Request) => Promise<Response>,
	request: Request,
): Promise<Response> {
	try {
		return await handler(request);
	} catch {
		return error("LinkedIn service is temporarily unavailable", 503);
	}
}

export async function callbackRoute(request: Request): Promise<Response> {
	try {
		return await callback(request);
	} catch {
		return redirectComplete("server_unavailable", "");
	}
}

function redirectComplete(
	errorCode: string | null,
	appState: string,
	ticket?: string,
): Response {
	const url = new URL(COMPLETE_URI);
	url.searchParams.set("app_state", appState);
	if (errorCode) url.searchParams.set("error", errorCode);
	if (ticket) url.searchParams.set("ticket", ticket);
	return new Response(null, {
		status: 302,
		headers: { ...NO_STORE, Location: url.href },
	});
}

async function rateLimit(
	request: Request,
	action: string,
	limit: number,
): Promise<Response | null> {
	const database = store();
	if (!database) return error("LinkedIn storage is unavailable", 503);
	const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
	const key = `${action}:${await hash(ip)}`;
	return (await database.rateLimit(key, limit, 600_000, Date.now()))
		? null
		: error("Too many requests; try again later", 429);
}

async function readJson(
	request: Request,
    maxLength = 4096,
): Promise<Record<string, unknown> | null> {
	if (
		!request.headers
			.get("Content-Type")
			?.toLowerCase()
			.startsWith("application/json")
	)
		return null;
	if (Number(request.headers.get("Content-Length")) > maxLength) return null;
	const text = await request.text();
	if (text.length > maxLength) return null;
	try {
		const parsed: unknown = JSON.parse(text);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

function bearer(request: Request): string | null {
	const value = request.headers.get("Authorization") ?? "";
	const match = /^Bearer ([A-Za-z0-9_-]{32,128})$/.exec(value);
	return match?.[1] ?? null;
}

export async function start(request: Request): Promise<Response> {
	const appState = new URL(request.url).searchParams.get("app_state") ?? "";
	if (!UUID.test(appState)) return error("Invalid app_state UUID", 400);
	const limited = await rateLimit(request, "start", 20);
	if (limited) return limited;
	const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } = bindings();
	if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET)
		return error("LinkedIn sign-in is not configured", 503);

	const state = randomToken();
	await requireStore().putState(
		await hash(state),
		appState,
		Date.now() + OAUTH_TTL_MS,
	);
	const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
	url.searchParams.set("response_type", "code");
	url.searchParams.set("client_id", LINKEDIN_CLIENT_ID);
	url.searchParams.set("redirect_uri", REDIRECT_URI);
	url.searchParams.set("scope", "openid profile w_member_social");
	url.searchParams.set("state", state);
	return new Response(null, {
		status: 302,
		headers: { ...NO_STORE, Location: url.href },
	});
}

export async function callback(request: Request): Promise<Response> {
	const query = new URL(request.url).searchParams;
	const state = query.get("state") ?? "";
	if (!RANDOM_TOKEN.test(state)) return redirectComplete("invalid_state", "");
	const appState = await requireStore().consumeState(
		await hash(state),
		Date.now(),
	);
	if (!appState) return redirectComplete("invalid_state", "");
	const limited = await rateLimit(request, "callback", 30);
	if (limited) return redirectComplete("rate_limited", appState);
	if (query.has("error"))
		return redirectComplete("authorization_denied", appState);
	const code = query.get("code") ?? "";
	if (!code || code.length > 4096)
		return redirectComplete("invalid_code", appState);

	const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } = bindings();
	if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET)
		return redirectComplete("not_configured", appState);
	try {
		const tokenResponse = await fetch(
			"https://www.linkedin.com/oauth/v2/accessToken",
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code,
					redirect_uri: REDIRECT_URI,
					client_id: LINKEDIN_CLIENT_ID,
					client_secret: LINKEDIN_CLIENT_SECRET,
				}),
				redirect: "manual",
				signal: AbortSignal.timeout(15_000),
			},
		);
		if (!tokenResponse.ok)
			return redirectComplete("token_exchange_failed", appState);
		const tokenData: unknown = await tokenResponse.json();
		if (!tokenData || typeof tokenData !== "object")
			return redirectComplete("token_exchange_failed", appState);
		const { access_token, expires_in } = tokenData as Record<string, unknown>;
		if (
			typeof access_token !== "string" ||
			!access_token ||
			typeof expires_in !== "number" ||
			!Number.isFinite(expires_in) ||
			expires_in <= 60
		) {
			return redirectComplete("token_exchange_failed", appState);
		}

		const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
			headers: { Authorization: `Bearer ${access_token}` },
			redirect: "manual",
			signal: AbortSignal.timeout(15_000),
		});
		if (!userResponse.ok) return redirectComplete("profile_failed", appState);
		const userData: unknown = await userResponse.json();
		if (!userData || typeof userData !== "object")
			return redirectComplete("profile_failed", appState);
		const { sub, name } = userData as Record<string, unknown>;
		if (
			typeof sub !== "string" ||
			!/^[A-Za-z0-9_-]{1,128}$/.test(sub) ||
			typeof name !== "string" ||
			!name.trim() ||
			name.length > 300
		) {
			return redirectComplete("profile_failed", appState);
		}

		const ticket = randomToken();
		const now = Date.now();
		const sessionExpiresAt =
			now + Math.min(MAX_SESSION_MS, expires_in * 1000 - 30_000);
		const ticketExpiresAt = Math.min(now + TICKET_TTL_MS, sessionExpiresAt);
		await requireStore().putTicket(
			await hash(ticket),
			sub,
			name.trim(),
			access_token,
			ticketExpiresAt,
			sessionExpiresAt,
		);
		return redirectComplete(null, appState, ticket);
	} catch {
		return redirectComplete("linkedin_unavailable", appState);
	}
}

export async function redeem(request: Request): Promise<Response> {
	const limited = await rateLimit(request, "redeem", 30);
	if (limited) return limited;
	const body = await readJson(request);
	const ticket = body?.ticket;
	if (typeof ticket !== "string" || !RANDOM_TOKEN.test(ticket))
		return error("Invalid ticket", 400);
	const sessionToken = randomToken();
	const result = await requireStore().redeemTicket(
		await hash(ticket),
		await hash(sessionToken),
		Date.now(),
	);
	if (!result) return error("Ticket expired or already used", 401);
	return json({
		session_token: sessionToken,
		member_id: result.member_id,
		name: result.name,
	});
}

export async function share(request: Request): Promise<Response> {
	const limited = await rateLimit(request, "share-ip", 30);
	if (limited) return limited;
	const sessionToken = bearer(request);
	if (!sessionToken) return error("Unauthorized", 401);
	const sessionHash = await hash(sessionToken);
	if (
		!(await requireStore().rateLimit(
			`share-session:${sessionHash}`,
			10,
			600_000,
			Date.now(),
		))
	) {
		return error("Too many posts; try again later", 429);
	}
	const session = await requireStore().getSession(sessionHash, Date.now());
	if (!session) return error("Session expired or disconnected", 401);
	const body = await readJson(request, 16_384);
	const title = body?.title;
	const url = body?.url;
	if (
		typeof title !== "string" ||
		!title.trim() ||
		title.length > 300 ||
		hasControlCharacter(title) ||
		typeof url !== "string" ||
		url.length > 2048
	)
		return error("Invalid title or URL", 400);
	let paperURL: URL;
	try {
		paperURL = new URL(url);
	} catch {
		return error("Invalid title or URL", 400);
	}
	if (
		paperURL.protocol !== "https:" ||
		!paperURL.hostname ||
		paperURL.username ||
		paperURL.password ||
		hasControlCharacter(url)
	)
		return error("Invalid title or URL", 400);

    const editedText = body?.commentary;
    if (editedText !== undefined && (
        typeof editedText !== "string" || !editedText.trim() || editedText.length > 3000 ||
        /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(editedText)
    )) return error("Post text must contain between 1 and 3,000 characters", 400);

    let commentary = typeof editedText === "string" ? editedText : `${title.trim()}\n${url}`;
    if (editedText === undefined && paperURL.hostname === "yongseokjo.com" && paperURL.pathname === "/readea/share") {
        const token = paperURL.searchParams.get("id") ?? "";
        if (/^[A-Za-z0-9_-]{20,80}$/.test(token)) {
            const payload = await requireStore().getPaperShare(token);
            if (payload) {
                const bundle = JSON.parse(payload);
                commentary = paperPostTemplate(bundle.papers, url);
            }
        }
    }

	try {
		const response = await fetch("https://api.linkedin.com/rest/posts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${session.linkedin_token}`,
				"Content-Type": "application/json",
				"X-Restli-Protocol-Version": "2.0.0",
				"Linkedin-Version": "202609",
			},
			body: JSON.stringify({
				author: `urn:li:person:${session.member_id}`,
				commentary,
				visibility: "PUBLIC",
				distribution: {
					feedDistribution: "MAIN_FEED",
					targetEntities: [],
					thirdPartyDistributionChannels: [],
				},
				lifecycleState: "PUBLISHED",
				isReshareDisabledByAuthor: false,
			}),
			redirect: "manual",
			signal: AbortSignal.timeout(15_000),
		});
		if (response.status === 401) {
			await requireStore().deleteSession(sessionHash);
			return error(
				"LinkedIn authorization expired; reconnect your account",
				401,
			);
		}
		const postId = response.headers.get("x-restli-id");
		if (response.status !== 201 || !postId)
			return error("LinkedIn did not confirm the post", 502);
		return json({ post_id: postId }, 201);
	} catch {
		return error("LinkedIn is unavailable; try again later", 502);
	}
}

export async function disconnect(request: Request): Promise<Response> {
	const limited = await rateLimit(request, "disconnect", 30);
	if (limited) return limited;
	const sessionToken = bearer(request);
	if (!sessionToken) return error("Unauthorized", 401);
	const deleted = await requireStore().deleteSession(await hash(sessionToken));
	return deleted
		? new Response(null, { status: 204, headers: NO_STORE })
		: error("Session expired or disconnected", 401);
}

export function complete(request: Request): Response {
	const query = new URL(request.url).searchParams;
	const success = query.has("ticket") && !query.has("error");
	const message = success
		? "Return to READEA to finish connecting your LinkedIn account."
		: "LinkedIn connection did not complete. Return to READEA and try again.";
	return new Response(
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>READEA LinkedIn</title></head><body><p>${message}</p></body></html>`,
		{
			status: 200,
			headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
		},
	);
}
