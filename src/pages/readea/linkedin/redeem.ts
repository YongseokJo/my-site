export const prerender = false;

import type { APIRoute } from "astro";
import { jsonRoute, redeem } from "../../../lib/linkedin-server";
export const POST: APIRoute = ({ request }) => jsonRoute(redeem, request);
