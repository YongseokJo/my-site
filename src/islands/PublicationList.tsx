import { useState, type KeyboardEvent } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

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

  function handleChipKeyDown(
    e: KeyboardEvent,
    action: () => void
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
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
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        {uniqueRoles.map((role) => {
          const isActive = activeRoles.has(role);
          return (
            <Badge
              key={role}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                  : "hover:bg-muted"
              )}
              role="button"
              tabIndex={0}
              onClick={() => toggleRole(role)}
              onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) =>
                handleChipKeyDown(e, () => toggleRole(role))
              }
            >
              {ROLE_LABELS[role] || role}
            </Badge>
          );
        })}

        {/* Visual separator */}
        <div className="w-px bg-border shrink-0 self-stretch" />

        {uniqueYears.map((year) => {
          const isActive = activeYears.has(year);
          return (
            <Badge
              key={year}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                  : "hover:bg-muted"
              )}
              role="button"
              tabIndex={0}
              onClick={() => toggleYear(year)}
              onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) =>
                handleChipKeyDown(e, () => toggleYear(year))
              }
            >
              {year}
            </Badge>
          );
        })}
      </div>

      {/* Publication cards */}
      <div className="space-y-3 mt-2">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No publications match the selected filters.
          </p>
        ) : (
          filtered.map((pub) => (
            <Card key={pub.id} className="bg-card border border-border">
              <CardContent className="px-3 py-1">
                <h3 className="text-base font-bold text-foreground mb-1">
                  {pub.title}
                </h3>
                <p className="text-xs text-foreground/70 leading-tight">
                  {highlightAuthor(pub.authors)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pub.venue}, {pub.year}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {pub.links.arxiv && (
                    <a
                      href={pub.links.arxiv}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View on arXiv"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-colors duration-150 hover:border-accent hover:text-accent"
                      >
                        arXiv
                        <ExternalLink size={14} />
                      </Button>
                    </a>
                  )}
                  {pub.links.doi && (
                    <a
                      href={pub.links.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View DOI"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-colors duration-150 hover:border-accent hover:text-accent"
                      >
                        DOI
                        <ExternalLink size={14} />
                      </Button>
                    </a>
                  )}
                  {pub.links.ads && (
                    <a
                      href={pub.links.ads}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View on ADS"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-colors duration-150 hover:border-accent hover:text-accent"
                      >
                        ADS
                        <ExternalLink size={14} />
                      </Button>
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
