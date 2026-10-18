export const prerender = false;
import type { APIRoute } from "astro";
import { paperShareImage } from "../../../lib/paper-share-server";
export const GET: APIRoute = ({ request }) => paperShareImage(request);
export const PUT: APIRoute = ({ request }) => paperShareImage(request);
