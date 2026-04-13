import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { IssueStatus, IssuePriority } from "@/lib/types";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  reporter: string;
  assignee: string | null;
  created_at: string;
}

function statusVariant(status: IssueStatus) {
  switch (status) {
    case "open":
      return "default" as const;
    case "in_progress":
      return "secondary" as const;
    case "closed":
      return "outline" as const;
  }
}

function priorityVariant(priority: IssuePriority) {
  switch (priority) {
    case "critical":
      return "destructive" as const;
    case "high":
      return "default" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
}

function statusLabel(status: IssueStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "closed":
      return "Closed";
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchIssues() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: fetchError } = await supabase
        .from("issues")
        .select("id, title, description, status, priority, reporter, assignee, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setIssues(data || []);
      setError("");
    } catch {
      setError("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIssues();

    function handleIssueCreated() {
      fetchIssues();
    }

    window.addEventListener("issue-created", handleIssueCreated);
    return () => {
      window.removeEventListener("issue-created", handleIssueCreated);
    };
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading issues...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (issues.length === 0) {
    return <p className="text-muted-foreground">No issues reported yet.</p>;
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <Card key={issue.id} size="sm">
          <CardHeader>
            <CardTitle>{issue.title}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant={statusVariant(issue.status)}>
                  {statusLabel(issue.status)}
                </Badge>
                <Badge variant={priorityVariant(issue.priority)}>
                  {issue.priority}
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          {issue.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {issue.description}
              </p>
            </CardContent>
          )}
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDate(issue.created_at)}</span>
              <span>{issue.assignee ? "Assigned" : "Unassigned"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
