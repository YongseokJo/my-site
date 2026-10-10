export const prerender = false;

import type { APIRoute } from "astro";
import { complete } from "../../../lib/linkedin-server";
export const GET: APIRoute = ({ request }) => complete(request);
