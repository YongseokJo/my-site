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

interface IssueListProps {
  userId?: string;
  userRole?: string;
}

export default function IssueList({ userId, userRole }: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(issue: Issue) {
    setEditing(issue.id);
    setEditTitle(issue.title);
    setEditDesc(issue.description || "");
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateErr } = await supabase
        .from("issues")
        .update({ title: editTitle, description: editDesc || null })
        .eq("id", id);
      if (updateErr) {
        setError(updateErr.message);
      } else {
        setIssues((prev) => prev.map((i) => i.id === id ? { ...i, title: editTitle, description: editDesc || null } : i));
        setEditing(null);
      }
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

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

  async function deleteIssue(id: string) {
    if (!confirm("Delete this issue?")) return;
    setDeleting(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: delError } = await supabase.from("issues").delete().eq("id", id);
      if (delError) {
        setError(delError.message);
      } else {
        setIssues((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      setError("Failed to delete issue.");
    } finally {
      setDeleting(null);
    }
  }

  if (issues.length === 0) {
    return <p className="text-muted-foreground">No issues reported yet.</p>;
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const isExpanded = expanded.has(issue.id);
        return (
          <Card key={issue.id} size="sm">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpanded((prev) => {
                const next = new Set(prev);
                if (next.has(issue.id)) next.delete(issue.id);
                else next.add(issue.id);
                return next;
              })}
            >
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className={`size-4 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  {issue.title}
                </CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Badge variant={statusVariant(issue.status)}>
                    {statusLabel(issue.status)}
                  </Badge>
                  <Badge variant={priorityVariant(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <>
                {editing === issue.id ? (
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium">Title</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={3}
                          className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditing(null); }}
                          className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); saveEdit(issue.id); }}
                          disabled={saving || !editTitle.trim()}
                          className="text-xs bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    {issue.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {issue.description}
                        </p>
                      </CardContent>
                    )}
                    <CardContent>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{formatDate(issue.created_at)}</span>
                        <div className="flex items-center gap-2">
                          <span>{issue.assignee ? "Assigned" : "Unassigned"}</span>
                          {issue.status === "open" && userId && (userRole === "admin" || userRole === "co_admin" || issue.reporter === userId) && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(issue); }}
                                className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteIssue(issue.id); }}
                                disabled={deleting === issue.id}
                                className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                              >
                                {deleting === issue.id ? "Deleting..." : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
