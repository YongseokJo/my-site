import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import {
  researchProjects,
  type ResearchProject,
} from "../data/research-projects";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sparkles,
  Brain,
  BarChart3,
};

function ProjectCard({
  project,
  isExpanded,
  onToggle,
}: {
  project: ResearchProject;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const IconComponent = iconMap[project.icon];

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <CardContent className="pt-2">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            {IconComponent && (
              <IconComponent size={32} className="text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-foreground">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={
                    project.status === "Active" ? "default" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
                {isExpanded ? (
                  <ChevronUp
                    size={20}
                    className="text-muted-foreground transition-transform duration-200"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    className="text-muted-foreground transition-transform duration-200"
                  />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.brief}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateRows: isExpanded ? "1fr" : "0fr",
            transition: "grid-template-rows 200ms ease",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div className="pt-4 border-t mt-4">
              <p className="text-base text-foreground leading-relaxed">
                {project.description}
              </p>

              {project.relatedPublications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">
                    Related Publications
                  </h4>
                  <ul className="space-y-1.5">
                    {project.relatedPublications.map((pub) => (
                      <li key={pub.url}>
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} className="shrink-0" />
                          <span>
                            {pub.title} ({pub.year})
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResearchProjects() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {researchProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isExpanded={expandedId === project.id}
          onToggle={() => handleToggle(project.id)}
        />
      ))}
    </div>
  );
}
