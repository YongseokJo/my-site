import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  role: "first-author" | "co-author";
  links: { arxiv: string; doi: string; ads: string; pdf: string };
}

interface PublicationListProps {
  publications: Publication[];
}

const ROLE_LABELS: Record<string, string> = {
  "first-author": "First Author",
  "co-author": "Co-Author",
};

function highlightAuthor(authors: string) {
  const parts = authors.split(/(Jo, Yongseok)/);
  return parts.map((part, i) =>
    part === "Jo, Yongseok" ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function PublicationList({ publications }: PublicationListProps) {
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set());
  const [activeYears, setActiveYears] = useState<Set<number>>(new Set());
  const [expandedAuthors, setExpandedAuthors] = useState<Set<string>>(new Set());

  const uniqueRoles = Array.from(new Set(publications.map((p) => p.role)));
  const uniqueYears = Array.from(new Set(publications.map((p) => p.year))).sort(
    (a, b) => b - a
  );

  function toggleRole(role: string) {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  }

  function toggleYear(year: number) {
    setActiveYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }

  function toggleAuthors(id: string) {
    setExpandedAuthors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = publications.filter((pub) => {
    const roleMatch =
      activeRoles.size === 0 || activeRoles.has(pub.role);
    const yearMatch =
      activeYears.size === 0 || activeYears.has(pub.year);
    return roleMatch && yearMatch;
  });

  return (
    <div>
      <div className="space-y-3" role="group" aria-label="Filter publications">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">Author role</span>
          {uniqueRoles.map((role) => {
            const isActive = activeRoles.has(role);
            return (
              <button
                key={role}
                type="button"
                className={`min-h-8 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}`}
                aria-pressed={isActive}
                onClick={() => toggleRole(role)}
              >
                {ROLE_LABELS[role] || role}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">Year</span>
          {uniqueYears.map((year) => {
            const isActive = activeYears.has(year);
            return (
              <button
                key={year}
                type="button"
                className={`min-h-8 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}`}
                aria-pressed={isActive}
                onClick={() => toggleYear(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publication cards */}
      <div className="space-y-3 mt-5">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No publications match the selected filters.
          </p>
        ) : (
          filtered.map((pub) => (
            <Card key={pub.id} className="bg-card border border-border">
              <CardContent className="px-4 py-3">
                <h3 className="text-base font-bold text-foreground mb-2">
                  {pub.title}
                </h3>
                <p id={`authors-${pub.id}`} className={`text-sm text-muted-foreground leading-relaxed ${expandedAuthors.has(pub.id) ? "" : "line-clamp-2"}`}>
                  {highlightAuthor(pub.authors)}
                </p>
                {pub.authors.length > 140 && (
                  <button
                    type="button"
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                    aria-controls={`authors-${pub.id}`}
                    aria-expanded={expandedAuthors.has(pub.id)}
                    onClick={() => toggleAuthors(pub.id)}
                  >
                    {expandedAuthors.has(pub.id) ? "Show fewer authors" : "Show all authors"}
                  </button>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {pub.venue}, {pub.year}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {pub.links.arxiv && (
                    <a
                      href={pub.links.arxiv}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${pub.title} on arXiv`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                    >
                      arXiv <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                  {pub.links.doi && (
                    <a
                      href={pub.links.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View DOI for ${pub.title}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                    >
                      DOI <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                  {pub.links.ads && (
                    <a
                      href={pub.links.ads}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${pub.title} on ADS`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                    >
                      ADS <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
