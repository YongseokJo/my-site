export const prerender = false;
import type { APIRoute } from "astro";
import { callback, safeRoute } from "../../../lib/meta-server";
export const GET: APIRoute = ({ request }) => safeRoute((r) => callback("threads", r), request);
