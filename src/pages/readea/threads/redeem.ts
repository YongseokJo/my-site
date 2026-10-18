export const prerender = false;
import type { APIRoute } from "astro";
import { redeem, safeRoute } from "../../../lib/meta-server";
export const POST: APIRoute = ({ request }) => safeRoute((r) => redeem("threads", r), request);
