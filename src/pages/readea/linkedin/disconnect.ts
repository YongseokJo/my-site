export const prerender = false;

import type { APIRoute } from "astro";
import { disconnect, jsonRoute } from "../../../lib/linkedin-server";
export const POST: APIRoute = ({ request }) => jsonRoute(disconnect, request);
