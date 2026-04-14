// Quick one-shot: send a test email through Resend to verify domain + API key.
// Usage: node scripts/test-resend.mjs [to-address]
// Reads RESEND_API_KEY from .env

import { readFileSync } from "node:fs";
import { Resend } from "resend";

// Minimal .env loader (no dotenv dep)
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
    })
);

const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY missing from .env");
  process.exit(1);
}

const to = process.argv[2] || "g.kerex@gmail.com";
const from = "Yongseok Jo <me@yongseokjo.com>";

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to: [to],
  subject: "Resend domain verification test — yongseokjo.com",
  html: `
    <p>This is a test email sent via Resend from <code>${from}</code>.</p>
    <p>If you received this and the headers show <strong>SPF/DKIM/DMARC PASS</strong>,
    domain verification for <code>yongseokjo.com</code> is fully working.</p>
    <p>Sent: ${new Date().toISOString()}</p>
  `,
});

if (error) {
  console.error("FAILED:", JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log("SUCCESS:", JSON.stringify(data, null, 2));
console.log(`\nTo: ${to}`);
console.log(`From: ${from}`);
console.log("\nNext: check inbox + spam. Open email → 'Show original' (Gmail) → look for SPF/DKIM/DMARC: PASS.");
