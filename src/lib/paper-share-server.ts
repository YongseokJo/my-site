import { env } from "cloudflare:workers";
import type { LinkedInStore } from "./linkedin-store";

const TOKEN = /^[A-Za-z0-9_-]{20,80}$/;
const HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
type Bindings = { LINKEDIN_STORE?: DurableObjectNamespace<LinkedInStore> };

function database(): DurableObjectStub<LinkedInStore> {
    const binding = (env as unknown as Bindings).LINKEDIN_STORE;
    if (!binding) throw new Error("Share storage unavailable");
    return binding.get(binding.idFromName("readea-linkedin"));
}

function json(value: object, status = 200): Response {
    return new Response(JSON.stringify(value), { status, headers: HEADERS });
}

function validPaper(value: unknown): boolean {
    if (!value || typeof value !== "object") return false;
    const paper = value as Record<string, unknown>;
    if (typeof paper.title !== "string" || !paper.title.trim() || paper.title.length > 500 ||
        typeof paper.url !== "string" || paper.url.length > 2048 ||
        !Array.isArray(paper.authors) || paper.authors.length > 20 ||
        !paper.authors.every(author => typeof author === "string" && author.length <= 200)) return false;
    try {
        const source = new URL(paper.url);
        if (!["http:", "https:"].includes(source.protocol)) return false;
        if (paper.pdfURL != null) {
            if (typeof paper.pdfURL !== "string") return false;
            const pdf = new URL(paper.pdfURL);
            if (!["http:", "https:"].includes(pdf.protocol)) return false;
        }
    } catch { return false; }
    return paper.doi == null || (typeof paper.doi === "string" && paper.doi.length <= 200);
}

export async function createPaperShare(request: Request): Promise<Response> {
    try {
        const db = database();
        const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
        const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
        if (!await db.rateLimit(`paper-share:${key}`, 30, 3_600_000, Date.now()))
            return json({ error: "Too many shares; try again later" }, 429);
        if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json"))
            return json({ error: "Expected JSON" }, 415);
        if (Number(request.headers.get("Content-Length")) > 32_000)
            return json({ error: "Share is too large" }, 413);
        const payload = await request.text();
        if (payload.length > 32_000) return json({ error: "Share is too large" }, 413);
        const bundle: unknown = JSON.parse(payload);
        if (!bundle || typeof bundle !== "object") return json({ error: "Invalid share" }, 400);
        const data = bundle as Record<string, unknown>;
        if (data.version !== 1 || !Array.isArray(data.papers) || data.papers.length < 1 ||
            data.papers.length > 40 || !data.papers.every(validPaper))
            return json({ error: "Invalid papers" }, 400);
        const token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
            .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
        await db.putPaperShare(token, payload, Date.now());
        return json({ url: `https://yongseokjo.com/readea/share?id=${token}` }, 201);
    } catch {
        return json({ error: "Could not create share" }, 503);
    }
}

export async function getPaperShare(request: Request): Promise<Response> {
    try {
        const token = new URL(request.url).searchParams.get("id") ?? "";
        if (!TOKEN.test(token)) return json({ error: "Invalid share link" }, 400);
        const payload = await database().getPaperShare(token);
        return payload ? new Response(payload, { headers: HEADERS }) : json({ error: "Share not found" }, 404);
    } catch {
        return json({ error: "Could not load share" }, 503);
    }
}
