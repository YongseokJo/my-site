export const prerender = false;
import type { APIRoute } from "astro";
import { postThread, safeRoute } from "../../../lib/meta-server";
export const POST: APIRoute = ({ request }) => safeRoute(postThread, request);
