export const prerender = false;
import type { APIRoute } from "astro";
import { safeRoute, start } from "../../../lib/meta-server";
export const GET: APIRoute = ({ request }) => safeRoute((r) => start("instagram", r), request);
