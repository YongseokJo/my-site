import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type {
  UserRole,
  IssueStatus,
  IssuePriority,
  ProposalStatus,
} from "@/lib/types";

// ---- Interfaces ----

interface DashboardProps {
  userId: string;
  userEmail: string;
  role: UserRole;
  displayName: string | null;
}

interface PendingUser {
  id: string;
  display_name: string | null;
  role: UserRole;
  approved: boolean;
  created_at: string;
}

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

interface ApprovedProfile {
  id: string;
  display_name: string | null;
}

// ---- Helpers ----

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

function roleBadgeVariant(role: UserRole) {
  switch (role) {
    case "admin":
    case "co_admin":
      return "destructive" as const;
    case "pi_mentor":
      return "default" as const;
    case "developer":
      return "secondary" as const;
    case "viewer":
      return "outline" as const;
  }
}

function roleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "co_admin":
      return "Co-Admin";
    case "pi_mentor":
      return "PI / Mentor";
    case "developer":
      return "Developer";
    case "viewer":
      return "Viewer";
  }
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

function proposalStatusVariant(status: ProposalStatus) {
  switch (status) {
    case "pending":
      return "secondary" as const;
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
  }
}

function proposalStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}

// ---- Sub-panels ----

function UserApprovalPanel({
  pendingUsers,
  onApprove,
  onRefresh,
}: {
  pendingUsers: PendingUser[];
  onApprove: (userId: string, role: UserRole) => Promise<void>;
  onRefresh: () => void;
}) {
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>(
    {}
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending User Approvals</CardTitle>
        <CardDescription>
          {pendingUsers.length === 0
            ? "No pending signups."
            : `${pendingUsers.length} user(s) awaiting approval.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">All users are approved.</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/30 ring-1 ring-foreground/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {u.display_name || "No name"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signed up {formatDate(u.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedRoles[u.id] || "developer"}
                    onValueChange={(val) =>
                      setSelectedRoles((prev) => ({
                        ...prev,
                        [u.id]: val as UserRole,
                      }))
                    }
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="co_admin">Co-Admin</SelectItem>
                      <SelectItem value="pi_mentor">PI / Mentor</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={actionLoading === u.id}
                    onClick={async () => {
                      setActionLoading(u.id);
                      await onApprove(
                        u.id,
                        selectedRoles[u.id] || "developer"
                      );
                      setActionLoading(null);
                      onRefresh();
                    }}
                  >
                    {actionLoading === u.id ? "..." : "Approve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminIssuesPanel({
  issues,
  approvedProfiles,
  onUpdateIssue,
  onRefresh,
}: {
  issues: Issue[];
  approvedProfiles: ApprovedProfile[];
  onUpdateIssue: (
    issueId: string,
    updates: Partial<Pick<Issue, "status" | "assignee">>
  ) => Promise<void>;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Issues</CardTitle>
        <CardDescription>
          {issues.length} issue(s) total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No issues reported.</p>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{issue.title}</p>
                    {issue.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {issue.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant={statusVariant(issue.status)}>
                      {statusLabel(issue.status)}
                    </Badge>
                    <Badge variant={priorityVariant(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Select
                    value={issue.status}
                    onValueChange={async (val) => {
                      setActionLoading(issue.id);
                      await onUpdateIssue(issue.id, {
                        status: val as IssueStatus,
                      });
                      setActionLoading(null);
                      onRefresh();
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">Assignee:</span>
                  <Select
                    value={issue.assignee || ""}
                    onValueChange={async (val) => {
                      setActionLoading(issue.id);
                      await onUpdateIssue(issue.id, {
                        assignee: val || null,
                      });
                      setActionLoading(null);
                      onRefresh();
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {approvedProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.display_name || p.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(issue.created_at)}
                  {actionLoading === issue.id && " -- Updating..."}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProposalReviewPanel({
  proposals,
  userId,
  onReview,
  onRefresh,
}: {
  proposals: Proposal[];
  userId: string;
  onReview: (
    proposalId: string,
    status: "approved" | "rejected",
    comment: string
  ) => Promise<void>;
  onRefresh: () => void;
}) {
  const [reviewComment, setReviewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const currentProposal = pendingProposals.find((p) => p.id === reviewingId);

  function openReview(proposalId: string) {
    setReviewingId(proposalId);
    setReviewComment("");
    setCommentError("");
    setDialogOpen(true);
  }

  async function handleReview(status: "approved" | "rejected") {
    if (!reviewComment.trim()) {
      setCommentError("A review comment is required.");
      return;
    }
    if (!reviewingId) return;
    setActionLoading(true);
    await onReview(reviewingId, status, reviewComment.trim());
    setActionLoading(false);
    setDialogOpen(false);
    setReviewingId(null);
    setReviewComment("");
    onRefresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposals Awaiting Review</CardTitle>
        <CardDescription>
          {pendingProposals.length === 0
            ? "No proposals pending review."
            : `${pendingProposals.length} proposal(s) to review.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingProposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All proposals have been reviewed.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-3 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{proposal.title}</p>
                    {proposal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {proposal.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={proposalStatusVariant(proposal.status)}>
                    {proposalStatusLabel(proposal.status)}
                  </Badge>
                </div>
                {proposal.rationale && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Rationale:</span>{" "}
                    {proposal.rationale}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {proposal.pi && (
                    <span>
                      <span className="font-medium">PI:</span> {proposal.pi}
                    </span>
                  )}
                  {proposal.scientific_mentor && (
                    <span>
                      <span className="font-medium">Mentor:</span>{" "}
                      {proposal.scientific_mentor}
                    </span>
                  )}
                  {proposal.position && (
                    <span>
                      <span className="font-medium">Position:</span>{" "}
                      {proposal.position}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(proposal.created_at)}
                  </span>
                  <Button size="sm" onClick={() => openReview(proposal.id)}>
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Proposal</DialogTitle>
            {currentProposal && (
              <DialogDescription>
                {currentProposal.title}
              </DialogDescription>
            )}
          </DialogHeader>
          {currentProposal && (
            <div className="space-y-3">
              {currentProposal.description && (
                <p className="text-sm text-muted-foreground">
                  {currentProposal.description}
                </p>
              )}
              {currentProposal.rationale && (
                <p className="text-sm">
                  <span className="font-medium">Rationale:</span>{" "}
                  {currentProposal.rationale}
                </p>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Review Comment <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => {
                    setReviewComment(e.target.value);
                    if (e.target.value.trim()) setCommentError("");
                  }}
                  placeholder="Explain your decision..."
                  rows={3}
                />
                {commentError && (
                  <p className="text-xs text-destructive">{commentError}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleReview("rejected")}
            >
              {actionLoading ? "..." : "Reject"}
            </Button>
            <Button
              size="sm"
              disabled={actionLoading}
              onClick={() => handleReview("approved")}
            >
              {actionLoading ? "..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function MyIssuesPanel({ issues }: { issues: Issue[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Issues</CardTitle>
        <CardDescription>
          {issues.length === 0
            ? "You haven't reported any issues."
            : `${issues.length} issue(s) submitted.`}
        </CardDescription>
        <CardAction>
          <a href="/software/issues">
            <Button variant="outline" size="sm">
              Submit New
            </Button>
          </a>
        </CardAction>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <a href="/software/issues" className="underline hover:text-foreground">
              Report your first issue
            </a>
          </p>
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(issue.created_at)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Badge variant={statusVariant(issue.status)}>
                    {statusLabel(issue.status)}
                  </Badge>
                  <Badge variant={priorityVariant(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyProposalsPanel({ proposals }: { proposals: Proposal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Proposals</CardTitle>
        <CardDescription>
          {proposals.length === 0
            ? "You haven't submitted any proposals."
            : `${proposals.length} proposal(s) submitted.`}
        </CardDescription>
        <CardAction>
          <a href="/software/proposals">
            <Button variant="outline" size="sm">
              Submit New
            </Button>
          </a>
        </CardAction>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <a
              href="/software/proposals"
              className="underline hover:text-foreground"
            >
              Submit your first proposal
            </a>
          </p>
        ) : (
          <div className="space-y-2">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    {proposal.title}
                  </p>
                  <Badge variant={proposalStatusVariant(proposal.status)}>
                    {proposalStatusLabel(proposal.status)}
                  </Badge>
                </div>
                {proposal.review_comment &&
                  (proposal.status === "approved" ||
                    proposal.status === "rejected") && (
                    <blockquote className="border-l-2 border-muted-foreground/30 pl-2 text-xs text-muted-foreground italic">
                      <span className="font-medium not-italic">Review:</span>{" "}
                      {proposal.review_comment}
                    </blockquote>
                  )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(proposal.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ViewerProposalsPanel({ proposals }: { proposals: Proposal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved Proposals</CardTitle>
        <CardDescription>
          {proposals.length === 0
            ? "No approved proposals yet."
            : `${proposals.length} approved proposal(s).`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Check back later for approved proposals.
          </p>
        ) : (
          <div className="space-y-2">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-1"
              >
                <p className="text-sm font-medium">{proposal.title}</p>
                {proposal.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {proposal.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {proposal.pi && (
                    <span>
                      <span className="font-medium">PI:</span> {proposal.pi}
                    </span>
                  )}
                  {proposal.scientific_mentor && (
                    <span>
                      <span className="font-medium">Mentor:</span>{" "}
                      {proposal.scientific_mentor}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(proposal.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Main Dashboard Component ----

export default function Dashboard({
  userId,
  userEmail,
  role,
  displayName,
}: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [approvedProfiles, setApprovedProfiles] = useState<ApprovedProfile[]>(
    []
  );
  const [viewerProposals, setViewerProposals] = useState<Proposal[]>([]);

  const supabase = createSupabaseBrowserClient();

  const fetchData = useCallback(async () => {
    try {
      setError("");

      if (role === "admin" || role === "co_admin") {
        // Fetch pending users
        const { data: pending } = await supabase
          .from("profiles")
          .select("*")
          .eq("approved", false);
        setPendingUsers(pending || []);

        // Fetch all issues
        const { data: issues } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });
        setAllIssues(issues || []);

        // Fetch all proposals
        const { data: proposals } = await supabase
          .from("proposals")
          .select("*")
          .order("created_at", { ascending: false });
        setAllProposals(proposals || []);

        // Fetch approved profiles for assignee dropdown
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("approved", true);
        setApprovedProfiles(profiles || []);

        // Fetch my issues and proposals too
        const { data: mIssues } = await supabase
          .from("issues")
          .select("*")
          .eq("reporter", userId)
          .order("created_at", { ascending: false });
        setMyIssues(mIssues || []);

        const { data: mProposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("submitter", userId)
          .order("created_at", { ascending: false });
        setMyProposals(mProposals || []);
      } else if (role === "pi_mentor") {
        // Fetch all proposals (for review)
        const { data: proposals } = await supabase
          .from("proposals")
          .select("*")
          .order("created_at", { ascending: false });
        setAllProposals(proposals || []);

        // Fetch my issues
        const { data: mIssues } = await supabase
          .from("issues")
          .select("*")
          .eq("reporter", userId)
          .order("created_at", { ascending: false });
        setMyIssues(mIssues || []);

        // Fetch my proposals
        const { data: mProposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("submitter", userId)
          .order("created_at", { ascending: false });
        setMyProposals(mProposals || []);
      } else if (role === "developer") {
        // Fetch my issues
        const { data: mIssues } = await supabase
          .from("issues")
          .select("*")
          .eq("reporter", userId)
          .order("created_at", { ascending: false });
        setMyIssues(mIssues || []);

        // Fetch my proposals
        const { data: mProposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("submitter", userId)
          .order("created_at", { ascending: false });
        setMyProposals(mProposals || []);
      } else if (role === "viewer") {
        // Viewers can only see approved proposals (RLS enforced)
        const { data: proposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        setViewerProposals(proposals || []);
      }
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutation handlers
  async function handleApproveUser(targetUserId: string, newRole: UserRole) {
    await supabase
      .from("profiles")
      .update({ approved: true, role: newRole })
      .eq("id", targetUserId);
  }

  async function handleUpdateIssue(
    issueId: string,
    updates: Partial<Pick<Issue, "status" | "assignee">>
  ) {
    await supabase.from("issues").update(updates).eq("id", issueId);
  }

  async function handleReviewProposal(
    proposalId: string,
    status: "approved" | "rejected",
    comment: string
  ) {
    await supabase
      .from("proposals")
      .update({
        status,
        review_comment: comment,
        reviewer: userId,
      })
      .eq("id", proposalId);
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">
            Welcome, {displayName || userEmail}
          </h2>
          <p className="text-sm text-muted-foreground">
            Your collaboration dashboard
          </p>
        </div>
        <Badge variant={roleBadgeVariant(role)}>{roleLabel(role)}</Badge>
      </div>

      <Separator />

      {/* Admin panels */}
      {(role === "admin" || role === "co_admin") && (
        <>
          <UserApprovalPanel
            pendingUsers={pendingUsers}
            onApprove={handleApproveUser}
            onRefresh={fetchData}
          />
          <AdminIssuesPanel
            issues={allIssues}
            approvedProfiles={approvedProfiles}
            onUpdateIssue={handleUpdateIssue}
            onRefresh={fetchData}
          />
          <ProposalReviewPanel
            proposals={allProposals}
            userId={userId}
            onReview={handleReviewProposal}
            onRefresh={fetchData}
          />
        </>
      )}

      {/* PI/Mentor panels */}
      {role === "pi_mentor" && (
        <>
          <ProposalReviewPanel
            proposals={allProposals}
            userId={userId}
            onReview={handleReviewProposal}
            onRefresh={fetchData}
          />
          <MyIssuesPanel issues={myIssues} />
          <MyProposalsPanel proposals={myProposals} />
        </>
      )}

      {/* Developer panels */}
      {role === "developer" && (
        <>
          <MyIssuesPanel issues={myIssues} />
          <MyProposalsPanel proposals={myProposals} />
        </>
      )}

      {/* Viewer panels */}
      {role === "viewer" && (
        <>
          <ViewerProposalsPanel proposals={viewerProposals} />
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Issue tracking is available for developers and above.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Common: My proposals for non-admin roles that aren't viewer */}
      {/* (already rendered above per role) */}
    </div>
  );
}
