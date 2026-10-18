export const prerender = false;
import type { APIRoute } from "astro";
import { callback, callbackLanding, safeRoute } from "../../../lib/meta-server";
export const GET: APIRoute = ({ request }) => callbackLanding("instagram", request);
export const POST: APIRoute = ({ request }) => safeRoute((r) => callback("instagram", r), request);
