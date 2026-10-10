export const prerender = false;

import type { APIRoute } from "astro";
import { callbackRoute } from "../../../lib/linkedin-server";
export const GET: APIRoute = ({ request }) => callbackRoute(request);
