# READEA Meta connections

The native app uses the website as its OAuth callback and token service. Public
app IDs are in `src/lib/meta-server.ts`. App secrets and user access tokens must
never be placed in the native app or checked into Git.

## Meta dashboard

- Instagram App ID: `1457143366366244`
- Threads App ID: `1602724647751193`
- Meta parent App ID: `2347492492720802`
- Instagram Login redirect URI: `https://yongseokjo.com/readea/instagram/callback`
- Threads redirect URI: `https://yongseokjo.com/readea/threads/callback`
- Instagram scopes: `instagram_business_basic`, `instagram_business_content_publish`
- Threads scopes: `threads_basic`, `threads_content_publish`

Instagram needs a professional (Business or Creator) account. The native share
menu only exposes Threads and the Facebook share dialog at this stage; Instagram
posting needs an image or video and is not represented as a working share action.
Facebook profile sharing uses Facebook's own dialog and requires no Facebook
Login token or Page permission.

## Cloudflare production environment

Add these as **encrypted secrets**, with the exact names shown:

- `INSTAGRAM_APP_SECRET` — the Instagram app secret for App ID `1457143366366244`
- `THREADS_APP_SECRET` — the Threads app secret for App ID `1602724647751193`

The `META_STORE` SQLite Durable Object binding and migration are declared in
`wrangler.toml`. Deploy the code and migration together. The OAuth callback URL
must be entered exactly in the corresponding Meta dashboard settings. The site
must remain associated with the native app for HTTPS ASWebAuthenticationSession
callbacks (the existing Associated Domains configuration covers the domain).

Test with Meta app roles before requesting advanced access for other users.
Disconnect deletes the server session and the local Keychain token. Access
tokens are kept in Cloudflare Durable Object storage. A connection expires
when its long-lived provider token expires; users then reconnect.
