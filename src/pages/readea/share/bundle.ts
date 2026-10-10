export const prerender = false;
import type { APIRoute } from "astro";
import { createPaperShare, getPaperShare } from "../../../lib/paper-share-server";
export const POST: APIRoute = ({ request }) => createPaperShare(request);
export const GET: APIRoute = ({ request }) => getPaperShare(request);
