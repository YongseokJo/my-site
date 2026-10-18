export const prerender = false;
import type { APIRoute } from "astro";
import { complete } from "../../../lib/meta-server";
export const GET: APIRoute = ({ request }) => complete("instagram", request);
