import { DurableObject } from "cloudflare:workers";

export class MetaStore extends DurableObject {
  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS oauth_states (
        token_hash TEXT PRIMARY KEY, provider TEXT NOT NULL,
        app_state TEXT NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tickets (
        token_hash TEXT PRIMARY KEY, provider TEXT NOT NULL,
        account_id TEXT NOT NULL, account_name TEXT NOT NULL,
        access_token TEXT NOT NULL, token_expires_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, provider TEXT NOT NULL,
        account_id TEXT NOT NULL, account_name TEXT NOT NULL,
        access_token TEXT NOT NULL, token_expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL
      );
    `);
  }

  rateLimit(key: string, limit: number, windowMs: number, now: number): boolean {
    const sql = this.ctx.storage.sql;
    sql.exec("DELETE FROM oauth_states WHERE expires_at <= ?", now);
    sql.exec("DELETE FROM tickets WHERE expires_at <= ?", now);
    sql.exec("DELETE FROM sessions WHERE token_expires_at <= ?", now);
    sql.exec("DELETE FROM rate_limits WHERE window_start <= ?", now - 3_600_000);
    const row = sql.exec("SELECT window_start, count FROM rate_limits WHERE key = ?", key)
      .toArray()[0] as { window_start: number; count: number } | undefined;
    if (!row || row.window_start + windowMs <= now) {
      sql.exec("INSERT INTO rate_limits VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1", key, now);
      return true;
    }
    if (row.count >= limit) return false;
    sql.exec("UPDATE rate_limits SET count = count + 1 WHERE key = ?", key);
    return true;
  }

  putState(hash: string, provider: string, appState: string, expiresAt: number): void {
    this.ctx.storage.sql.exec("INSERT INTO oauth_states VALUES (?, ?, ?, ?)", hash, provider, appState, expiresAt);
  }

  consumeState(hash: string, provider: string, now: number): string | null {
    const row = this.ctx.storage.sql.exec(
      "DELETE FROM oauth_states WHERE token_hash = ? AND provider = ? RETURNING app_state, expires_at",
      hash, provider,
    ).toArray()[0] as { app_state: string; expires_at: number } | undefined;
    return row && row.expires_at > now ? row.app_state : null;
  }

  putTicket(hash: string, provider: string, id: string, name: string, token: string, tokenExpiresAt: number, expiresAt: number): void {
    this.ctx.storage.sql.exec("INSERT INTO tickets VALUES (?, ?, ?, ?, ?, ?, ?)", hash, provider, id, name, token, tokenExpiresAt, expiresAt);
  }

  redeemTicket(hash: string, sessionHash: string, provider: string, now: number): { id: string; name: string; expiresAt: number } | null {
    return this.ctx.storage.transactionSync(() => {
      const row = this.ctx.storage.sql.exec(
        "DELETE FROM tickets WHERE token_hash = ? AND provider = ? RETURNING account_id, account_name, access_token, token_expires_at, expires_at",
        hash, provider,
      ).toArray()[0] as { account_id: string; account_name: string; access_token: string; token_expires_at: number; expires_at: number } | undefined;
      if (!row || row.expires_at <= now || row.token_expires_at <= now) return null;
      this.ctx.storage.sql.exec("INSERT INTO sessions VALUES (?, ?, ?, ?, ?, ?)", sessionHash, provider, row.account_id, row.account_name, row.access_token, row.token_expires_at);
      return { id: row.account_id, name: row.account_name, expiresAt: row.token_expires_at };
    });
  }

  getSession(hash: string, provider: string, now: number): { id: string; name: string; token: string } | null {
    const row = this.ctx.storage.sql.exec(
      "SELECT account_id, account_name, access_token, token_expires_at FROM sessions WHERE token_hash = ? AND provider = ?",
      hash, provider,
    ).toArray()[0] as { account_id: string; account_name: string; access_token: string; token_expires_at: number } | undefined;
    if (!row) return null;
    if (row.token_expires_at <= now) {
      this.deleteSession(hash, provider);
      return null;
    }
    return { id: row.account_id, name: row.account_name, token: row.access_token };
  }

  deleteSession(hash: string, provider: string): void {
    this.ctx.storage.sql.exec("DELETE FROM sessions WHERE token_hash = ? AND provider = ?", hash, provider);
  }
}
