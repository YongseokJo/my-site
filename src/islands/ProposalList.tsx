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
import type { ProposalStatus } from "@/lib/types";

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  rationale: string | null;
  pi: string | null;
  scientific_mentor: string | null;
  position: string | null;
  basic_profile: string | null;
  submitter: string;
  review_comment: string | null;
  reviewer: string | null;
  created_at: string;
}

function statusVariant(status: ProposalStatus) {
  switch (status) {
    case "pending":
      return "secondary" as const;
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
  }
}

function statusLabel(status: ProposalStatus): string {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ProposalListProps {
  userId: string;
  userRole?: string;
}

export default function ProposalList({ userId, userRole }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(proposal: Proposal) {
    setEditing(proposal.id);
    setEditTitle(proposal.title);
    setEditDesc(proposal.description || "");
    setEditRationale(proposal.rationale || "");
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateErr } = await supabase
        .from("proposals")
        .update({ title: editTitle, description: editDesc || null, rationale: editRationale || null })
        .eq("id", id);
      if (updateErr) {
        setError(updateErr.message);
      } else {
        setProposals((prev) => prev.map((p) => p.id === id ? { ...p, title: editTitle, description: editDesc || null, rationale: editRationale || null } : p));
        setEditing(null);
      }
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function fetchProposals() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: fetchError } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setProposals(data || []);
      setError("");
    } catch {
      setError("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProposals();

    function handleProposalCreated() {
      fetchProposals();
    }

    window.addEventListener("proposal-created", handleProposalCreated);
    return () => {
      window.removeEventListener("proposal-created", handleProposalCreated);
    };
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading proposals...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  async function deleteProposal(id: string) {
    if (!confirm("Delete this proposal?")) return;
    setDeleting(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: delError } = await supabase.from("proposals").delete().eq("id", id);
      if (delError) {
        setError(delError.message);
      } else {
        setProposals((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      setError("Failed to delete proposal.");
    } finally {
      setDeleting(null);
    }
  }

  if (proposals.length === 0) {
    return <p className="text-muted-foreground">No proposals submitted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const isExpanded = expanded.has(proposal.id);
        return (
          <Card key={proposal.id} size="sm">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpanded((prev) => {
                const next = new Set(prev);
                if (next.has(proposal.id)) next.delete(proposal.id);
                else next.add(proposal.id);
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
                  {proposal.title}
                  {proposal.submitter === userId && (
                    <span className="text-xs text-muted-foreground font-normal">(yours)</span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant(proposal.status)}>
                    {statusLabel(proposal.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(proposal.created_at)}
                  </span>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <>
                {editing === proposal.id ? (
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
                      <div>
                        <label className="text-xs font-medium">Rationale</label>
                        <textarea
                          value={editRationale}
                          onChange={(e) => setEditRationale(e.target.value)}
                          rows={2}
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
                          onClick={(e) => { e.stopPropagation(); saveEdit(proposal.id); }}
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
                    {proposal.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {proposal.description}
                        </p>
                      </CardContent>
                    )}
                    {proposal.review_comment &&
                      (proposal.status === "approved" ||
                        proposal.status === "rejected") && (
                        <CardContent>
                          <blockquote className="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic">
                            <span className="font-medium not-italic">
                              Review comment:
                            </span>{" "}
                            {proposal.review_comment}
                          </blockquote>
                        </CardContent>
                      )}
                    <CardContent>
                      <div className="flex justify-end gap-2">
                        {proposal.status === "pending" && (userRole === "admin" || userRole === "co_admin" || proposal.submitter === userId) && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); startEdit(proposal); }}
                              className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteProposal(proposal.id); }}
                              disabled={deleting === proposal.id}
                              className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                            >
                              {deleting === proposal.id ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
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
