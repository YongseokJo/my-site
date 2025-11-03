import re
import unicodedata
from pathlib import Path
from datetime import date

import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import homogenize_latex_encoding
import yaml

# === Paths ===
ROOT = Path(__file__).resolve().parents[1]
BIB_DIR = ROOT / "bib"
DATA_DIR = ROOT / "data"

# Define which bib files to convert
BIB_FILES = {
    "first_pub.bib": "first_pub.yaml",
    "co_pub.bib": "co_pub.yaml",
}

# === Constants ===
MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "may": 5, "jun": 6, "jul": 7, "aug": 8,
    "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

JOURNAL_MAP = {
    r"\apj": "ApJ",
    r"\mnras": "MNRAS",
    r"\aap": "A&A",
    r"\aj": "AJ",
    r"\apjs": "ApJS",
    r"\apjl": "ApJL",
}


# === Utility functions ===
def load_bib(path: Path):
    parser = BibTexParser(common_strings=True)
    parser.customization = homogenize_latex_encoding
    with open(path, encoding="utf-8") as f:
        return bibtexparser.load(f, parser=parser)


def parse_month(m):
    if not m:
        return 1
    m = str(m).strip().lower()
    try:
        mi = int(m)
        if 1 <= mi <= 12:
            return mi
    except ValueError:
        pass
    return MONTH_MAP.get(m[:3], 1)


def normalize_journal(journal):
    if not journal:
        return ""
    j = str(journal).strip()
    if j.startswith("{") and j.endswith("}"):
        j = j[1:-1].strip()
    return JOURNAL_MAP.get(j, j)


def clean_latex(s: str) -> str:
    """Remove BibTeX/LaTeX braces and escaped accents."""
    if not s:
        return ""
    s = re.sub(r"[{}]", "", s)
    latex_accents = {
        r"\\'a": "á", r"\\'e": "é", r"\\'i": "í", r"\\'o": "ó", r"\\'u": "ú",
        r"\\`a": "à", r"\\`e": "è", r"\\`i": "ì", r"\\`o": "ò", r"\\`u": "ù",
        r'\\"a': "ä", r'\\"o': "ö", r'\\"u': "ü", r'\\"A': "Ä", r'\\"O': "Ö", r'\\"U': "Ü",
        r"\\~n": "ñ", r"\\'A": "Á", r"\\'E": "É", r"\\'I": "Í", r"\\'O": "Ó", r"\\'U": "Ú",
        r"\\c{c}": "ç", r"\\c{C}": "Ç",
        r"\\ss": "ß",
    }
    for k, v in latex_accents.items():
        s = re.sub(k, v, s)
    s = re.sub(r"\\[a-zA-Z]+", "", s)
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


# === Core conversion ===
def entry_to_yaml_item(entry: dict) -> dict:
    title = clean_latex(entry.get("title", "").strip())
    authors_raw = entry.get("author", "")
    authors = clean_latex(authors_raw.replace(" and ", "; "))

    journal = entry.get("journal") or entry.get("booktitle") or ""
    venue = clean_latex(normalize_journal(journal))

    try:
        year = int(entry.get("year", "1900"))
    except ValueError:
        year = 1900

    month = parse_month(entry.get("month"))
    date_str = f"{year:04d}-{month:02d}-01"

    # arXiv
    arxiv_url = ""
    if entry.get("archivePrefix", "").lower() == "arxiv":
        eprint = entry.get("eprint", "").strip()
        if eprint:
            arxiv_url = f"https://arxiv.org/abs/{eprint}"

    # DOI
    doi_url = ""
    doi = (entry.get("doi") or "").strip()
    if doi:
        doi_url = doi if doi.lower().startswith("http") else f"https://doi.org/{doi}"

    # ADS
    ads_url = (entry.get("adsurl") or "").strip()
    if ads_url and not ads_url.startswith("http"):
        ads_url = f"https://{ads_url}"

    item = {
        "title": title,
        "authors": authors,
        "venue": venue,
        "year": year,
        "date": date_str,
        "links": {
            "arxiv": arxiv_url,
            "doi": doi_url,
            "ads": ads_url,
            "pdf": "",
        },
    }
    return item


def convert_bib_to_yaml(bib_path: Path, yaml_path: Path):
    if not bib_path.exists():
        print(f"⚠️  Skipping missing file: {bib_path}")
        return

    bibdb = load_bib(bib_path)
    items = [entry_to_yaml_item(e) for e in bibdb.entries]
    items.sort(key=lambda x: x["date"], reverse=True)

    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(items, f, sort_keys=False, allow_unicode=True)

    print(f"✅ Converted {bib_path.name} → {yaml_path.name} ({len(items)} entries)")


def main():
    for bib_name, yaml_name in BIB_FILES.items():
        bib_path = BIB_DIR / bib_name
        yaml_path = DATA_DIR / yaml_name
        convert_bib_to_yaml(bib_path, yaml_path)


if __name__ == "__main__":
    main()
