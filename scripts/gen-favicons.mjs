// Generates PNG favicon sizes from public/favicon.svg.
// Usage: node scripts/gen-favicons.mjs
//
// Output:
//   public/favicon-32.png         (32x32  — modern tab fallback)
//   public/favicon-192.png        (192x192 — Android / PWA)
//   public/favicon-512.png        (512x512 — PWA splash)
//   public/apple-touch-icon.png   (180x180 — iOS home screen)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const svg = readFileSync(join(publicDir, "favicon.svg"));

const targets = [
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-192.png", size: 192 },
  { name: "favicon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  const png = await sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();
  writeFileSync(join(publicDir, name), png);
  console.log(`wrote public/${name} (${size}x${size}, ${png.length} bytes)`);
}
