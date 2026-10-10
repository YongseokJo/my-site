export const prerender = false;

import type { APIRoute } from "astro";
import { jsonRoute, start } from "../../../lib/linkedin-server";
export const GET: APIRoute = ({ request }) => jsonRoute(start, request);
