export const prerender = false;
import type { APIRoute } from "astro";
import { disconnect, safeRoute } from "../../../lib/meta-server";
export const POST: APIRoute = ({ request }) => safeRoute((r) => disconnect("threads", r), request);
