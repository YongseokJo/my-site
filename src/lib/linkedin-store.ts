import { DurableObject } from "cloudflare:workers";

interface StateRow {
	app_state: string;
	expires_at: number;
}
interface TicketRow {
	member_id: string;
	name: string;
	linkedin_token: string;
	expires_at: number;
	session_expires_at: number;
}
export interface LinkedInSession {
	member_id: string;
	name: string;
	linkedin_token: string;
	expires_at: number;
}

// One SQLite-backed object serializes all one-time OAuth operations. Cloudflare
// encrypts Durable Object storage at rest; no token is sent to the browser.
export class LinkedInStore extends DurableObject {
	constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
		super(ctx, env);
		ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS oauth_states (
        token_hash TEXT PRIMARY KEY, app_state TEXT NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tickets (
        token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, name TEXT NOT NULL,
        linkedin_token TEXT NOT NULL, expires_at INTEGER NOT NULL,
        session_expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, name TEXT NOT NULL,
        linkedin_token TEXT NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL
      );
    `);
	}

	rateLimit(
		key: string,
		limit: number,
		windowMs: number,
		now: number,
	): boolean {
		const sql = this.ctx.storage.sql;
		sql.exec("DELETE FROM oauth_states WHERE expires_at <= ?", now);
		sql.exec("DELETE FROM tickets WHERE expires_at <= ?", now);
		sql.exec("DELETE FROM sessions WHERE expires_at <= ?", now);
		sql.exec("DELETE FROM rate_limits WHERE window_start <= ?", now - 600_000);
		const row = sql
			.exec("SELECT window_start, count FROM rate_limits WHERE key = ?", key)
			.toArray()[0] as { window_start: number; count: number } | undefined;
		if (!row || row.window_start + windowMs <= now) {
			sql.exec(
				"INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1",
				key,
				now,
			);
			return true;
		}
		if (row.count >= limit) return false;
		sql.exec("UPDATE rate_limits SET count = count + 1 WHERE key = ?", key);
		return true;
	}

	putState(hash: string, appState: string, expiresAt: number): void {
		this.ctx.storage.sql.exec(
			"INSERT INTO oauth_states (token_hash, app_state, expires_at) VALUES (?, ?, ?)",
			hash,
			appState,
			expiresAt,
		);
	}

	consumeState(hash: string, now: number): string | null {
		const row = this.ctx.storage.sql
			.exec(
				"DELETE FROM oauth_states WHERE token_hash = ? RETURNING app_state, expires_at",
				hash,
			)
			.toArray()[0] as unknown as StateRow | undefined;
		return row && row.expires_at > now ? row.app_state : null;
	}

	putTicket(
		hash: string,
		memberId: string,
		name: string,
		token: string,
		expiresAt: number,
		sessionExpiresAt: number,
	): void {
		this.ctx.storage.sql.exec(
			"INSERT INTO tickets (token_hash, member_id, name, linkedin_token, expires_at, session_expires_at) VALUES (?, ?, ?, ?, ?, ?)",
			hash,
			memberId,
			name,
			token,
			expiresAt,
			sessionExpiresAt,
		);
	}

	redeemTicket(
		ticketHash: string,
		sessionHash: string,
		now: number,
	): { member_id: string; name: string } | null {
		return this.ctx.storage.transactionSync(() => {
			const row = this.ctx.storage.sql
				.exec(
					"DELETE FROM tickets WHERE token_hash = ? RETURNING member_id, name, linkedin_token, expires_at, session_expires_at",
					ticketHash,
				)
				.toArray()[0] as unknown as TicketRow | undefined;
			if (!row || row.expires_at <= now) return null;
			this.ctx.storage.sql.exec(
				"INSERT INTO sessions (token_hash, member_id, name, linkedin_token, expires_at) VALUES (?, ?, ?, ?, ?)",
				sessionHash,
				row.member_id,
				row.name,
				row.linkedin_token,
				row.session_expires_at,
			);
			return { member_id: row.member_id, name: row.name };
		});
	}

	getSession(hash: string, now: number): LinkedInSession | null {
		const row = this.ctx.storage.sql
			.exec(
				"SELECT member_id, name, linkedin_token, expires_at FROM sessions WHERE token_hash = ?",
				hash,
			)
			.toArray()[0] as unknown as LinkedInSession | undefined;
		if (!row) return null;
		if (row.expires_at <= now) {
			this.ctx.storage.sql.exec(
				"DELETE FROM sessions WHERE token_hash = ?",
				hash,
			);
			return null;
		}
		return row;
	}

	deleteSession(hash: string): boolean {
		return (
			this.ctx.storage.sql
				.exec(
					"DELETE FROM sessions WHERE token_hash = ? RETURNING token_hash",
					hash,
				)
				.toArray().length > 0
		);
	}
}
