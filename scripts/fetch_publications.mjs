#!/usr/bin/env node

/**
 * Fetch publications from NASA ADS and generate publications.yaml
 * Usage: node scripts/fetch_publications.mjs
 *
 * Requires ADS_API_TOKEN in .env or as environment variable
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "..", "src", "data", "publications.yaml");

// Load .env if exists
try {
  const envPath = path.join(__dirname, "..", ".env");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const ADS_TOKEN = process.env.ADS_API_TOKEN;
if (!ADS_TOKEN) {
  console.error("Error: ADS_API_TOKEN not found. Add it to .env or set as env var.");
  process.exit(1);
}

const AUTHOR = "Jo, Yongseok";
const LIBRARY_ID = "miCGF6FnSgW_IUWliF3sDw";
const ADS_API = "https://api.adsabs.harvard.edu/v1";

async function fetchPapers() {
  // Step 1: Get bibcodes from the public library
  const libRes = await fetch(`${ADS_API}/biblib/libraries/${LIBRARY_ID}?rows=200`, {
    headers: { Authorization: `Bearer ${ADS_TOKEN}` },
  });

  if (!libRes.ok) {
    console.error(`ADS Library API error: ${libRes.status} ${libRes.statusText}`);
    const body = await libRes.text();
    console.error(body);
    process.exit(1);
  }

  const libData = await libRes.json();
  const bibcodes = libData.documents || [];
  console.log(`Library contains ${bibcodes.length} papers.`);

  if (bibcodes.length === 0) return [];

  // Step 2: Fetch full metadata for all bibcodes
  const searchRes = await fetch(`${ADS_API}/search/query?${new URLSearchParams({
    q: `bibcode:(${bibcodes.map(b => `"${b}"`).join(" OR ")})`,
    fl: "bibcode,title,author,pub,year,date,doi,identifier,doctype,citation_count",
    sort: "date desc",
    rows: "200",
  })}`, {
    headers: { Authorization: `Bearer ${ADS_TOKEN}` },
  });

  if (!searchRes.ok) {
    console.error(`ADS Search API error: ${searchRes.status} ${searchRes.statusText}`);
    const body = await searchRes.text();
    console.error(body);
    process.exit(1);
  }

  const data = await searchRes.json();
  return data.response.docs;
}

function getArxivId(identifiers) {
  if (!identifiers) return null;
  for (const id of identifiers) {
    const match = id.match(/^(\d{4}\.\d{4,5})$/);
    if (match) return match[1];
    const arxivMatch = id.match(/arXiv:(\d{4}\.\d{4,5})/);
    if (arxivMatch) return arxivMatch[1];
  }
  return null;
}

function determineRole(authors, targetAuthor) {
  if (!authors || authors.length === 0) return "co-author";
  const first = authors[0].toLowerCase();
  if (first.includes("jo,") && first.includes("yongseok")) return "first-author";
  return "co-author";
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function escapeYaml(str) {
  if (!str) return "''";
  if (str.includes(":") || str.includes("#") || str.includes("'") || str.includes('"') || str.includes("{") || str.includes("}")) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return str;
}

function toYaml(papers) {
  const lines = [];
  for (const paper of papers) {
    const title = Array.isArray(paper.title) ? paper.title[0] : paper.title;
    const authors = (paper.author || []).join("; ");
    const venue = paper.pub || "Unknown";
    const year = parseInt(paper.year) || new Date().getFullYear();
    const dateStr = paper.date ? paper.date.substring(0, 10) : `${year}-01-01`;
    const role = determineRole(paper.author, AUTHOR);
    const doi = Array.isArray(paper.doi) ? paper.doi[0] : paper.doi;
    const arxivId = getArxivId(paper.identifier);
    const bibcode = paper.bibcode;

    const id = `${(paper.author?.[0] || "unknown").split(",")[0].toLowerCase()}-${year}-${slugify(title).split("-").slice(0, 3).join("-")}`;

    lines.push(`- id: ${id}`);
    lines.push(`  title: ${escapeYaml(title)}`);
    lines.push(`  authors: ${escapeYaml(authors)}`);
    lines.push(`  venue: ${escapeYaml(venue)}`);
    lines.push(`  year: ${year}`);
    lines.push(`  date: '${dateStr}'`);
    lines.push(`  role: ${role}`);
    lines.push(`  citations: ${paper.citation_count || 0}`);
    lines.push(`  links:`);
    lines.push(`    arxiv: ${arxivId ? `https://arxiv.org/abs/${arxivId}` : "''"}`);
    lines.push(`    doi: ${doi ? `https://doi.org/${doi}` : "''"}`);
    lines.push(`    ads: ${bibcode ? `https://ui.adsabs.harvard.edu/abs/${bibcode}` : "''"}`);
    lines.push(`    pdf: ''`);
  }
  return lines.join("\n") + "\n";
}

async function main() {
  console.log(`Fetching publications from ADS library ${LIBRARY_ID}...`);
  const papers = await fetchPapers();
  console.log(`Found ${papers.length} papers.`);

  // Library is curated, so just filter doctypes
  const filtered = papers.filter(
    (p) => p.doctype === "article" || p.doctype === "eprint"
  );
  console.log(`${filtered.length} articles/eprints after doctype filter.`);

  const yaml = toYaml(filtered);
  fs.writeFileSync(OUTPUT, yaml, "utf-8");
  console.log(`Written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
