import { paperTitleText, normalizeSharedPaper } from "./paper-title-text";
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
        (paper.arxivId != null && (typeof paper.arxivId !== "string" || paper.arxivId.length > 100)) ||
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
        if (Array.isArray(data.papers)) data.papers = data.papers.map(normalizeSharedPaper);
        if (data.version !== 1 || !Array.isArray(data.papers) || data.papers.length < 1 ||
            data.papers.length > 40 || !data.papers.every(validPaper))
            return json({ error: "Invalid papers" }, 400);
        const token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
            .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
        await db.putPaperShare(token, JSON.stringify(data), Date.now());
        const imageUploadToken = crypto.randomUUID() + crypto.randomUUID();
        await db.prepareShareImage(token, await hashToken(imageUploadToken), Date.now() + 600_000);
        return json({ url: `https://yongseokjo.com/readea/share?id=${token}`, imageUploadToken }, 201);
    } catch {
        return json({ error: "Could not create share" }, 503);
    }
}

export async function getPaperShare(request: Request): Promise<Response> {
    try {
        const token = new URL(request.url).searchParams.get("id") ?? "";
        if (!TOKEN.test(token)) return json({ error: "Invalid share link" }, 400);
        const payload = await database().getPaperShare(token);
        if (!payload) return json({ error: "Share not found" }, 404);
        const bundle = JSON.parse(payload);
        bundle.papers = bundle.papers.map((paper: { title: string }) => ({ ...paper, title: paperTitleText(paper.title) }));
        return json(bundle);
    } catch {
        return json({ error: "Could not load share" }, 503);
    }
}

async function hashToken(token: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export async function sharePreviewMetadata(token: string | null) {
    if (!token || !TOKEN.test(token)) return null;
    try {
        const db = database();
        const payload = await db.getPaperShare(token);
        if (!payload) return null;
        const bundle = JSON.parse(payload);
        return {
            title: bundle.papers.length === 1 ? paperTitleText(bundle.papers[0].title) : `${bundle.papers.length} papers from READEA`,
            image: await db.hasShareImage(token) ? `https://yongseokjo.com/readea/share/image?id=${token}` : null,
            url: `https://yongseokjo.com/readea/share?id=${token}`,
        };
    } catch { return null; }
}

export async function paperShareImage(request: Request): Promise<Response> {
    const token = new URL(request.url).searchParams.get("id") ?? "";
    if (!TOKEN.test(token)) return new Response("Invalid link", { status: 400 });
    try {
        const db = database();
        if (request.method === "GET") {
            const image = await db.getShareImage(token);
            return image ? new Response(image, { headers: {
                "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            } }) : new Response("Not found", { status: 404 });
        }
        const bearer = request.headers.get("Authorization")?.match(/^Bearer ([a-f0-9-]{72})$/)?.[1];
        if (!bearer) return new Response("Unauthorized", { status: 401 });
        if (request.headers.get("Content-Type") !== "image/jpeg") return new Response("Expected JPEG", { status: 415 });
        // Bound the stream before buffering untrusted uploads.
        const reader = request.body?.getReader();
        if (!reader) return new Response("Missing image", { status: 400 });
        const chunks: Uint8Array[] = [];
        let length = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.length;
            if (length > 900_000) { await reader.cancel(); return new Response("Image too large", { status: 413 }); }
            chunks.push(value);
        }
        const image = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) { image.set(chunk, offset); offset += chunk.length; }
        if (length < 4 || image[0] !== 255 || image[1] !== 216 || image[length - 2] !== 255 || image[length - 1] !== 217)
            return new Response("Invalid JPEG", { status: 400 });
        const saved = await db.putShareImage(token, await hashToken(bearer), image.buffer);
        return new Response(null, { status: saved ? 201 : 403 });
    } catch { return new Response("Preview unavailable", { status: 503 }); }
}
