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
const ORCID = "0000-0003-3977-1761";
const ADS_API = "https://api.adsabs.harvard.edu/v1/search/query";

// Keywords that indicate this is NOT your paper (false positive from same-name authors)
const EXCLUDE_KEYWORDS = ["IGF", "IGFBP", "pediatric", "endocrine", "insulin", "serum", "clinical", "patients", "medical"];

async function fetchPapers() {
  const params = new URLSearchParams({
    q: `author:"Jo, Yongseok" (orcid:${ORCID} OR aff:"Columbia" OR aff:"Chicago" OR aff:"SkAI" OR keyword:"cosmology" OR keyword:"galaxy" OR keyword:"simulation" OR keyword:"black hole" OR keyword:"star" OR keyword:"dark matter" OR keyword:"machine learning")`,
    fq: [
      '{!type=aqp v=$fq_author}',
      '{!type=aqp v=$fq_database}',
    ],
    fq_author: '(author_facet_hier:"1/Jo, Y/Jo, Yongseok")',
    fq_database: '(database:astronomy OR database:physics)',
    fl: "bibcode,title,author,pub,year,date,doi,identifier,doctype,citation_count",
    sort: "date desc",
    rows: "200",
  });

  const res = await fetch(`${ADS_API}?${params}`, {
    headers: { Authorization: `Bearer ${ADS_TOKEN}` },
  });

  if (!res.ok) {
    console.error(`ADS API error: ${res.status} ${res.statusText}`);
    const body = await res.text();
    console.error(body);
    process.exit(1);
  }

  const data = await res.json();
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
  console.log(`Fetching publications for "${AUTHOR}" from ADS...`);
  const papers = await fetchPapers();
  console.log(`Found ${papers.length} papers.`);

  // Filter to only refereed articles and eprints (skip erratum, abstract, etc.)
  const articles = papers.filter(
    (p) => p.doctype === "article" || p.doctype === "eprint"
  );
  console.log(`${articles.length} articles/eprints after doctype filter.`);

  // Remove false positives from same-name authors in other fields
  const filtered = articles.filter((p) => {
    const title = (Array.isArray(p.title) ? p.title[0] : p.title || "").toLowerCase();
    const venue = (p.pub || "").toLowerCase();
    const combined = title + " " + venue;
    const excluded = EXCLUDE_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));
    if (excluded) console.log(`  Excluded: ${Array.isArray(p.title) ? p.title[0] : p.title}`);
    return !excluded;
  });
  console.log(`${filtered.length} papers after excluding false positives.`);

  const yaml = toYaml(filtered);
  fs.writeFileSync(OUTPUT, yaml, "utf-8");
  console.log(`Written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
