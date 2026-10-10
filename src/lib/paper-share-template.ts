interface SharePaper {
    title: string;
    url: string;
    authors: string[];
}

// Keep complete paper entries and reserve room for the import link.
export function paperPostTemplate(papers: SharePaper[], importURL: string): string {
    const footer = `Open in READEA\n${importURL}`;
    const intro = papers.length === 1 ? "Research shared with READEA" : `${papers.length} research papers · Shared with READEA`;
    let body = intro;
    let included = 0;
    for (const paper of papers) {
        const title = paper.title.replace(/\s+/g, " ").trim();
        const authors = paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "");
        const entry = [papers.length > 1 ? `${included + 1}. ${title}` : title, authors, `Read the paper: ${paper.url}`]
            .filter(Boolean).join("\n");
        if (body.length + entry.length + footer.length + 100 > 2800) break;
        body += `\n\n${entry}`;
        included++;
    }
    if (included < papers.length) {
        body += `\n\n${papers.length - included} more ${papers.length - included === 1 ? "paper" : "papers"} included in the collection.`;
    }
    return `${body}\n\n${footer}`;
}
