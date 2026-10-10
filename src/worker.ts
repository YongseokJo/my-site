import { handle } from "@astrojs/cloudflare/handler";

export { LinkedInStore } from "./lib/linkedin-store";

export default {
	fetch(request: Request, env: unknown, ctx: ExecutionContext) {
		// The native client sends an empty POST for disconnect. Give that one
		// bearer-authenticated endpoint a JSON content type so Astro's form CSRF
		// guard does not reject it before the route can validate the bearer token.
		if (
			request.method === "POST" &&
			new URL(request.url).pathname === "/readea/linkedin/disconnect" &&
			!request.headers.has("Content-Type")
		) {
			const headers = new Headers(request.headers);
			headers.set("Content-Type", "application/json");
			request = new Request(request, { headers });
		}
		return handle(request, env, ctx);
	},
};
