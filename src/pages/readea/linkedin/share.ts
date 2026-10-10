export const prerender = false;

import type { APIRoute } from "astro";
import { jsonRoute, share } from "../../../lib/linkedin-server";
export const POST: APIRoute = ({ request }) => jsonRoute(share, request);
