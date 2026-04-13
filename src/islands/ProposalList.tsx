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
      {proposals.map((proposal) => (
        <Card key={proposal.id} size="sm">
          <CardHeader>
            <CardTitle>
              {proposal.title}
              {proposal.submitter === userId && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (yours)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={statusVariant(proposal.status)}>
                  {statusLabel(proposal.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(proposal.created_at)}
                </span>
                {proposal.status === "pending" && (userRole === "admin" || userRole === "co_admin" || proposal.submitter === userId) && (
                  <button
                    onClick={() => deleteProposal(proposal.id)}
                    disabled={deleting === proposal.id}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    {deleting === proposal.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          {proposal.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
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
        </Card>
      ))}
    </div>
  );
}
