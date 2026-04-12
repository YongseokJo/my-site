/**
 * BibTeX-to-YAML converter for publications.
 *
 * Reads .bib files from bib/ directory and writes a merged, sorted
 * publications.yaml to src/data/publications.yaml.
 *
 * Usage: node scripts/bib_to_yaml.mjs
 */

import { parse } from "@retorquere/bibtex-parser";
import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BIB_DIR = path.join(ROOT, "bib");
const OUTPUT = path.join(ROOT, "src", "data", "publications.yaml");

// === Constants ===

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4,
  may: 5, jun: 6, jul: 7, aug: 8,
  sep: 9, oct: 10, nov: 11, dec: 12,
};

const JOURNAL_MAP = {
  "\\apj": "ApJ",
  "\\mnras": "MNRAS",
  "\\aap": "A&A",
  "\\aj": "AJ",
  "\\apjs": "ApJS",
  "\\apjl": "ApJL",
};

// Words to skip when generating the slug from a title
const STOP_WORDS = new Set([
  "a", "an", "the", "of", "on", "in", "for", "and", "or", "to",
  "from", "with", "by", "at", "its", "via", "using",
]);

// === Utility functions ===

/**
 * Remove BibTeX/LaTeX braces and convert LaTeX accents to Unicode.
 */
function cleanLatex(s) {
  if (!s) return "";

  // Remove braces
  s = s.replace(/[{}]/g, "");

  // LaTeX accent map
  const accents = [
    [/\\'a/g, "\u00e1"], [/\\'e/g, "\u00e9"], [/\\'i/g, "\u00ed"],
    [/\\'o/g, "\u00f3"], [/\\'u/g, "\u00fa"], [/\\'A/g, "\u00c1"],
    [/\\'E/g, "\u00c9"], [/\\'I/g, "\u00cd"], [/\\'O/g, "\u00d3"],
    [/\\'U/g, "\u00da"], [/\\`a/g, "\u00e0"], [/\\`e/g, "\u00e8"],
    [/\\`i/g, "\u00ec"], [/\\`o/g, "\u00f2"], [/\\`u/g, "\u00f9"],
    [/\\"a/g, "\u00e4"], [/\\"o/g, "\u00f6"], [/\\"u/g, "\u00fc"],
    [/\\"A/g, "\u00c4"], [/\\"O/g, "\u00d6"], [/\\"U/g, "\u00dc"],
    [/\\~n/g, "\u00f1"], [/\\cc/g, "\u00e7"], [/\\cC/g, "\u00c7"],
    [/\\ss/g, "ss"],
  ];

  for (const [pattern, replacement] of accents) {
    s = s.replace(pattern, replacement);
  }

  // Remove remaining LaTeX commands
  s = s.replace(/\\[a-zA-Z]+/g, "");

  // Normalize Unicode
  s = s.normalize("NFC");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Convert month string or number to integer 1-12.
 */
function parseMonth(m) {
  if (!m) return 1;
  const s = String(m).trim().toLowerCase();
  const n = parseInt(s, 10);
  if (!isNaN(n) && n >= 1 && n <= 12) return n;
  return MONTH_MAP[s.slice(0, 3)] || 1;
}

/**
 * Map LaTeX journal macros to standard abbreviations.
 */
function normalizeJournal(journal) {
  if (!journal) return "";
  let j = String(journal).trim();
  if (j.startsWith("{") && j.endsWith("}")) {
    j = j.slice(1, -1).trim();
  }
  return JOURNAL_MAP[j] || j;
}

/**
 * Generate a slug ID from first author surname, year, and first significant title word.
 */
function generateId(authorLastName, year, title) {
  const surname = authorLastName.toLowerCase().replace(/[^a-z]/g, "");
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const significantWord = words.find((w) => w.length > 0 && !STOP_WORDS.has(w)) || "untitled";
  return `${surname}-${year}-${significantWord}`;
}

/**
 * Format authors from parsed BibTeX author objects to "Last, First; Last, First" string.
 */
function formatAuthors(authors) {
  if (!authors || !Array.isArray(authors)) return "";
  return authors
    .map((a) => {
      const last = cleanLatex(a.lastName || "");
      const first = cleanLatex(a.firstName || "");
      return first ? `${last}, ${first}` : last;
    })
    .join("; ");
}

/**
 * Convert a parsed BibTeX entry to the YAML publication object format.
 */
function entryToYaml(entry, role) {
  const fields = entry.fields;

  const title = cleanLatex(fields.title || "");
  const authors = formatAuthors(fields.author);
  const venue = cleanLatex(normalizeJournal(fields.journal || fields.booktitle || ""));
  const year = parseInt(fields.year, 10) || 1900;
  const month = parseMonth(fields.month);
  const date = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;

  // Extract first author last name for ID
  const firstAuthorLast = fields.author?.[0]?.lastName || "unknown";

  const id = generateId(firstAuthorLast, year, fields.title || "");

  // arXiv URL
  let arxiv = "";
  if (String(fields.archiveprefix || "").toLowerCase() === "arxiv" && fields.eprint) {
    arxiv = `https://arxiv.org/abs/${fields.eprint.trim()}`;
  }

  // DOI URL
  let doi = "";
  const rawDoi = (fields.doi || "").trim();
  if (rawDoi) {
    doi = rawDoi.toLowerCase().startsWith("http") ? rawDoi : `https://doi.org/${rawDoi}`;
  }

  // ADS URL
  let ads = (fields.adsurl || "").trim();
  if (ads && !ads.startsWith("http")) {
    ads = `https://${ads}`;
  }

  return {
    id,
    title,
    authors,
    venue,
    year,
    date,
    role,
    links: { arxiv, doi, ads, pdf: "" },
  };
}

/**
 * Parse a .bib file and return publication entries.
 */
function parseBibFile(filePath, role) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filePath} not found, skipping.`);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const result = parse(content, { sentenceCase: false });

  return result.entries.map((entry) => entryToYaml(entry, role));
}

/**
 * Main: read bib files, merge, sort by date descending, write YAML.
 */
function convertBibToYaml() {
  const firstPubPath = path.join(BIB_DIR, "first_pub.bib");
  const coPubPath = path.join(BIB_DIR, "co_pub.bib");

  const firstPubs = parseBibFile(firstPubPath, "first-author");
  const coPubs = parseBibFile(coPubPath, "co-author");

  const all = [...firstPubs, ...coPubs];
  all.sort((a, b) => b.date.localeCompare(a.date));

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const yamlStr = yaml.dump(all, { sortKeys: false, lineWidth: -1 });
  fs.writeFileSync(OUTPUT, yamlStr, "utf-8");

  console.log(`Converted ${all.length} publications to ${OUTPUT}`);
  console.log(`  First-author: ${firstPubs.length}`);
  console.log(`  Co-author: ${coPubs.length}`);
}

convertBibToYaml();
