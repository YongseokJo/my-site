# READEA LinkedIn backend

The routes under `/readea/linkedin/` implement the contract in the READEA app
repository (`docs/linkedin-backend-contract.md`). They run in the Astro Worker.
OAuth state, one-time tickets, sessions, and rate limits live in the
`LINKEDIN_STORE` SQLite Durable Object. Cloudflare encrypts Durable Object data
at rest. LinkedIn access tokens never reach the app or browser.

## Production setup

1. In the LinkedIn Developer Portal, keep **Sign In with LinkedIn using OpenID
   Connect** and **Share on LinkedIn** enabled. Register exactly
   `https://yongseokjo.com/readea/linkedin/callback` as an authorized redirect URL.
2. In the Cloudflare Worker `my-site`, set `LINKEDIN_CLIENT_ID` and
   `LINKEDIN_CLIENT_SECRET` as encrypted server secrets. Do not put either value
   in `wrangler.toml`, a `PUBLIC_` variable, source control, or the native app.
3. Deploy the Worker from `main`. The `LINKEDIN_STORE` binding and SQLite class
   migration are declared in `wrangler.toml`.

The Worker requests only `openid profile w_member_social`. It uses LinkedIn's
Posts API version `202609`; update the header before that version is retired.

## Smoke checks

- `GET /readea/linkedin/start` without `app_state` returns HTTP 400 JSON.
- `GET /readea/linkedin/complete` returns HTTP 200 HTML.
- Unauthenticated `POST /readea/linkedin/share` and `disconnect` return HTTP
  401 JSON. An invalid `redeem` ticket returns a non-2xx JSON error.
- With secrets and the portal redirect configured, connect through READEA,
  publish one test paper after the app's confirmation prompt, and disconnect.

Do not paste a real OAuth code, ticket, session token, LinkedIn access token,
or client secret into diagnostic commands or logs.
