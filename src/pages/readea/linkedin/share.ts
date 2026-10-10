export const prerender = false;

import type { APIRoute } from "astro";
import { jsonRoute, share } from "../../../lib/linkedin-server";
export const POST: APIRoute = ({ request }) => jsonRoute(share, request);

export const GET: APIRoute = () => new Response(JSON.stringify({ editablePosts: true }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});
