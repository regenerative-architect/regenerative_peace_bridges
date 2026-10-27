#!/usr/bin/env node
/* =====================================================================
   tools/make-icons.mjs — creates the PNG app icons from icon.svg.
   Optional: only needed if you change the icon.
   Needs the "sharp" image library:  npm install sharp
   Run from the app folder:          node tools/make-icons.mjs
   ===================================================================== */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require("sharp"); } catch (e) {
  try { sharp = require(process.env.SHARP_PATH || "sharp"); } catch (e2) {
    console.error("This script needs the 'sharp' library. Install it with: npm install sharp");
    process.exit(1);
  }
}

const svg = readFileSync(join(root, "icon.svg"), "utf8");
// Maskable icons need a full-bleed background with the artwork inside the
// central safe zone, because launchers crop them to circles or squircles.
const maskable = svg
  .replace('<rect width="512" height="512" rx="112" fill="url(#sky)"/>', '<rect width="512" height="512" fill="url(#sky)"/>')
  .replace('<rect width="512" height="512" rx="112" fill="url(#sun)"/>', '<rect width="512" height="512" fill="url(#sun)"/><g transform="translate(51.2 51.2) scale(0.8)">')
  .replace("</svg>", "</g></svg>");

const jobs = [
  [svg, 192, "icon-192.png"],
  [svg, 512, "icon-512.png"],
  [svg, 180, "apple-touch-icon.png"],
  [maskable, 512, "icon-maskable-512.png"]
];
for (const [source, size, name] of jobs) {
  await sharp(Buffer.from(source), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(root, name));
  console.log("wrote", name);
}
