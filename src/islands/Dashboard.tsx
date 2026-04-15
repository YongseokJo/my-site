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

type ProjectProgress =
  | "in_progress"
  | "on_hold"
  | "stalled"
  | "published"
  | "completed"
  | "aborted";

const PROGRESS_OPTIONS: { value: ProjectProgress; label: string; dotClass: string }[] = [
  { value: "in_progress", label: "In Progress", dotClass: "bg-green-500" },
  { value: "on_hold", label: "On Hold", dotClass: "bg-gray-400" },
  { value: "stalled", label: "Stalled", dotClass: "bg-yellow-500" },
  { value: "published", label: "Published", dotClass: "bg-blue-500" },
  { value: "completed", label: "Completed", dotClass: "bg-teal-500" },
  { value: "aborted", label: "Aborted", dotClass: "bg-red-500" },
];

function progressMeta(progress: ProjectProgress | null | undefined) {
  return (
    PROGRESS_OPTIONS.find((o) => o.value === progress) ?? PROGRESS_OPTIONS[0]
  );
}

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  rationale: string | null;
  pi: string | null;
  pi_email: string | null;
  scientific_mentor: string | null;
  mentor_email: string | null;
  position: string | null;
  affiliation: string | null;
  basic_profile: string | null;
  submitter: string;
  review_comment: string | null;
  reviewer: string | null;
  progress: ProjectProgress | null;
  is_locked: boolean;
  created_at: string;
}

interface ApprovedProfile {
  id: string;
  display_name: string | null;
  email?: string | null;
  role?: UserRole;
  created_at?: string;
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
    case "researcher":
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
      return "Researcher";
    case "researcher":
      return "Researcher";
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
                      <SelectItem value="researcher">Researcher</SelectItem>
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

function UserListPanel({
  users,
  onChangeRole,
  onRefresh,
}: {
  users: ApprovedProfile[];
  onChangeRole: (userId: string, newRole: UserRole) => Promise<void>;
  onRefresh: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex items-center gap-2">
          <svg className={`size-4 shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          All Users
        </CardTitle>
        <CardDescription>{users.length} approved user(s).</CardDescription>
      </CardHeader>
      {!collapsed && <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved users.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.display_name || u.id.slice(0, 8)}</p>
                  {u.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      <a
                        href={`mailto:${u.email}`}
                        className="underline hover:text-primary"
                      >
                        {u.email}
                      </a>
                    </p>
                  )}
                  {u.created_at && (
                    <p className="text-xs text-muted-foreground">Joined {formatDate(u.created_at)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={u.role || "developer"}
                    onValueChange={async (val) => {
                      setActionLoading(u.id);
                      await onChangeRole(u.id, val as UserRole);
                      setActionLoading(null);
                      onRefresh();
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="co_admin">Co-Admin</SelectItem>
                      <SelectItem value="pi_mentor">PI / Mentor</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                    </SelectContent>
                  </Select>
                  {actionLoading === u.id && <span className="text-xs text-muted-foreground">Saving...</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>}
    </Card>
  );
}

function AdminIssuesPanel({
  issues,
  approvedProfiles,
  onUpdateIssue,
  onDeleteIssue,
  onRefresh,
}: {
  issues: Issue[];
  approvedProfiles: ApprovedProfile[];
  onUpdateIssue: (
    issueId: string,
    updates: Partial<Pick<Issue, "status" | "assignee">>
  ) => Promise<void>;
  onDeleteIssue: (issueId: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className={`size-4 shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              All To-Do / Issues
            </CardTitle>
            <CardDescription>{issues.length} item(s) total.</CardDescription>
          </div>
        </div>
      </CardHeader>
      {!collapsed && <CardContent>
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
                          <span className="flex flex-col items-start gap-0">
                            <span className="text-sm">
                              {p.display_name || p.id.slice(0, 8)}
                              {p.role && (
                                <span className="text-xs text-muted-foreground ml-1.5">
                                  · {roleLabel(p.role)}
                                </span>
                              )}
                            </span>
                            {p.email && (
                              <span className="text-xs text-muted-foreground">
                                {p.email}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(issue.created_at)}
                    {actionLoading === issue.id && " -- Updating..."}
                  </p>
                  {issue.status === "open" && (
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this issue?")) return;
                        setDeleteLoading(issue.id);
                        await onDeleteIssue(issue.id);
                        setDeleteLoading(null);
                        onRefresh();
                      }}
                      disabled={deleteLoading === issue.id}
                      className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === issue.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>}
    </Card>
  );
}

function ProposalReviewPanel({
  proposals,
  userId,
  onReview,
  onDeleteProposal,
  onRefresh,
}: {
  proposals: Proposal[];
  userId: string;
  onReview: (
    proposalId: string,
    status: "approved" | "rejected",
    comment: string
  ) => Promise<void>;
  onDeleteProposal: (proposalId: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const [reviewComment, setReviewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex items-center gap-2">
          <svg className={`size-4 shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          Proposals Awaiting Review
        </CardTitle>
        <CardDescription>
          {pendingProposals.length === 0
            ? "No proposals pending review."
            : `${pendingProposals.length} proposal(s) to review.`}
        </CardDescription>
      </CardHeader>
      {!collapsed && <CardContent>
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
                      {proposal.pi_email && (
                        <>
                          {" — "}
                          <a
                            href={`mailto:${proposal.pi_email}`}
                            className="underline hover:text-primary"
                          >
                            {proposal.pi_email}
                          </a>
                        </>
                      )}
                    </span>
                  )}
                  {proposal.scientific_mentor && (
                    <span>
                      <span className="font-medium">Mentor/Collab:</span>{" "}
                      {proposal.scientific_mentor}
                      {proposal.mentor_email && (
                        <>
                          {" — "}
                          <a
                            href={`mailto:${proposal.mentor_email}`}
                            className="underline hover:text-primary"
                          >
                            {proposal.mentor_email}
                          </a>
                        </>
                      )}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this proposal?")) return;
                        setDeleteLoading(proposal.id);
                        await onDeleteProposal(proposal.id);
                        setDeleteLoading(null);
                        onRefresh();
                      }}
                      disabled={deleteLoading === proposal.id}
                      className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === proposal.id ? "Deleting..." : "Delete"}
                    </button>
                    <Button size="sm" onClick={() => openReview(proposal.id)}>
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words">Review Proposal</DialogTitle>
            {currentProposal && (
              <DialogDescription className="break-words">
                {currentProposal.title}
              </DialogDescription>
            )}
          </DialogHeader>
          {currentProposal && (
            <div className="space-y-3 overflow-hidden">
              {currentProposal.description && (
                <p className="text-sm text-muted-foreground break-words">
                  {currentProposal.description}
                </p>
              )}
              {currentProposal.rationale && (
                <p className="text-sm break-words">
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

function MyIssuesPanel({ issues, onDelete, onEdit }: { issues: Issue[]; onDelete: (id: string) => Promise<void>; onEdit: (id: string, updates: { title: string; description: string | null }) => Promise<void> }) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex items-center gap-2">
          <svg className={`size-4 shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          My To-Do / Issues
        </CardTitle>
        <CardDescription>
          {issues.length === 0
            ? "You haven't reported any issues."
            : `${issues.length} item(s) submitted.`}
        </CardDescription>
        <CardAction>
          <a href="/software/issues" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm">
              Submit New
            </Button>
          </a>
        </CardAction>
      </CardHeader>
      {!collapsed && <CardContent>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <a href="/software/issues" className="underline hover:text-foreground">
              Report your first to-do / issue
            </a>
          </p>
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-2"
              >
                {editing === issue.id ? (
                  <div className="space-y-2">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors">Cancel</button>
                      <button
                        onClick={async () => {
                          setSaving(true);
                          await onEdit(issue.id, { title: editTitle, description: editDesc || null });
                          setSaving(false);
                          setEditing(null);
                        }}
                        disabled={saving || !editTitle.trim()}
                        className="text-xs bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                      >{saving ? "Saving..." : "Save"}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(issue.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusVariant(issue.status)}>{statusLabel(issue.status)}</Badge>
                      <Badge variant={priorityVariant(issue.priority)}>{issue.priority}</Badge>
                      {issue.status === "open" && (
                        <>
                          <button onClick={() => { setEditing(issue.id); setEditTitle(issue.title); setEditDesc(issue.description || ""); }} className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors">Edit</button>
                          <button
                            onClick={async () => { if (!confirm("Delete this issue?")) return; setDeleting(issue.id); await onDelete(issue.id); setDeleting(null); }}
                            disabled={deleting === issue.id}
                            className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                          >{deleting === issue.id ? "..." : "Delete"}</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>}
    </Card>
  );
}

function MyProposalsPanel({ proposals, onDelete, onEdit }: { proposals: Proposal[]; onDelete: (id: string) => Promise<void>; onEdit: (id: string, updates: { title: string; description: string | null; rationale: string | null }) => Promise<void> }) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex items-center gap-2">
          <svg className={`size-4 shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          My Proposals
        </CardTitle>
        <CardDescription>
          {proposals.length === 0
            ? "You haven't submitted any proposals."
            : `${proposals.length} proposal(s) submitted.`}
        </CardDescription>
        <CardAction>
          <a href="/software/proposals" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm">
              Submit New
            </Button>
          </a>
        </CardAction>
      </CardHeader>
      {!collapsed && <CardContent>
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
                className="p-2 rounded-lg bg-muted/30 ring-1 ring-foreground/5 space-y-2"
              >
                {editing === proposal.id ? (
                  <div className="space-y-2">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} placeholder="Description" className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    <textarea value={editRationale} onChange={(e) => setEditRationale(e.target.value)} rows={2} placeholder="Rationale" className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors">Cancel</button>
                      <button
                        onClick={async () => {
                          setSaving(true);
                          await onEdit(proposal.id, { title: editTitle, description: editDesc || null, rationale: editRationale || null });
                          setSaving(false);
                          setEditing(null);
                        }}
                        disabled={saving || !editTitle.trim()}
                        className="text-xs bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                      >{saving ? "Saving..." : "Save"}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{proposal.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={proposalStatusVariant(proposal.status)}>{proposalStatusLabel(proposal.status)}</Badge>
                        {proposal.status === "pending" && (
                          <>
                            <button onClick={() => { setEditing(proposal.id); setEditTitle(proposal.title); setEditDesc(proposal.description || ""); setEditRationale(proposal.rationale || ""); }} className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors">Edit</button>
                            <button
                              onClick={async () => { if (!confirm("Delete this proposal?")) return; setDeleting(proposal.id); await onDelete(proposal.id); setDeleting(null); }}
                              disabled={deleting === proposal.id}
                              className="text-xs text-destructive border border-destructive rounded-md px-2 py-1 hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                            >{deleting === proposal.id ? "..." : "Delete"}</button>
                          </>
                        )}
                      </div>
                    </div>
                    {proposal.review_comment &&
                      (proposal.status === "approved" || proposal.status === "rejected") && (
                        <blockquote className="border-l-2 border-muted-foreground/30 pl-2 text-xs text-muted-foreground italic">
                          <span className="font-medium not-italic">Review:</span> {proposal.review_comment}
                        </blockquote>
                      )}
                    <p className="text-xs text-muted-foreground">{formatDate(proposal.created_at)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>}
    </Card>
  );
}

function ProjectsPanel({
  proposals,
  profiles,
  userId,
  role,
  onDelete,
  onUpdateProgress,
  onToggleLock,
}: {
  proposals: Proposal[];
  profiles: ApprovedProfile[];
  userId: string;
  role: UserRole;
  onDelete: (proposalId: string) => Promise<void>;
  onUpdateProgress: (proposalId: string, progress: ProjectProgress) => Promise<void>;
  onToggleLock: (proposalId: string, locked: boolean) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingProgressId, setSavingProgressId] = useState<string | null>(null);
  const [togglingLockId, setTogglingLockId] = useState<string | null>(null);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const isAdmin = role === "admin" || role === "co_admin";

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          {proposals.length === 0
            ? "No active projects yet."
            : `${proposals.length} active project(s).`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Approved proposals will appear here as projects.
          </p>
        ) : (
          <div className="space-y-2">
            {proposals.map((proposal) => {
              const isOpen = expanded.has(proposal.id);
              const owner = profileById.get(proposal.submitter);
              const ownerName = owner?.display_name || "—";
              const ownerEmail = owner?.email || null;
              const canDelete = isAdmin;
              const canEditProgress =
                isAdmin || (proposal.submitter === userId && !proposal.is_locked);
              const isDeleting = deletingId === proposal.id;
              const isSavingProgress = savingProgressId === proposal.id;
              const isTogglingLock = togglingLockId === proposal.id;
              const progress = progressMeta(proposal.progress);
              return (
                <div
                  key={proposal.id}
                  className="rounded-lg bg-muted/30 ring-1 ring-foreground/5"
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggle(proposal.id)}
                      aria-expanded={isOpen}
                      className="flex-1 min-w-0 flex items-center justify-between gap-3 p-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            aria-hidden="true"
                            title={progress.label}
                            className={`shrink-0 inline-block w-2.5 h-2.5 rounded-full ${progress.dotClass}`}
                          />
                          {proposal.is_locked && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3 shrink-0 text-muted-foreground"
                              aria-label="Locked"
                            >
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                          <p className="text-sm font-medium truncate">{proposal.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Owner: {ownerName}
                          {proposal.position && ` (${proposal.position})`}
                          {proposal.affiliation && ` · ${proposal.affiliation}`}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={`text-xs text-muted-foreground shrink-0 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      >
                        ▸
                      </span>
                    </button>
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive shrink-0 mr-2"
                        disabled={isDeleting}
                        onClick={async () => {
                          if (!confirm(`Delete project "${proposal.title}"?`)) return;
                          setDeletingId(proposal.id);
                          try {
                            await onDelete(proposal.id);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                  {ownerEmail && (
                    <div className="px-2 pb-2 -mt-1 text-xs">
                      <a
                        href={`mailto:${ownerEmail}`}
                        className="text-muted-foreground underline hover:text-primary truncate inline-block max-w-full"
                      >
                        {ownerEmail}
                      </a>
                    </div>
                  )}
                  {isOpen && (
                    <div className="px-2 pb-2 pt-1 border-t border-foreground/5 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Progress:</span>
                          {canEditProgress ? (
                          <Select
                            value={progress.value}
                            onValueChange={async (v) => {
                              setSavingProgressId(proposal.id);
                              try {
                                await onUpdateProgress(proposal.id, v as ProjectProgress);
                              } finally {
                                setSavingProgressId(null);
                              }
                            }}
                            disabled={isSavingProgress}
                          >
                            <SelectTrigger className="h-7 w-[160px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRESS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`inline-block w-2.5 h-2.5 rounded-full ${opt.dotClass}`}
                                    />
                                    {opt.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${progress.dotClass}`}
                            />
                            {progress.label}
                          </span>
                        )}
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={isTogglingLock}
                            onClick={async () => {
                              setTogglingLockId(proposal.id);
                              try {
                                await onToggleLock(proposal.id, !proposal.is_locked);
                              } finally {
                                setTogglingLockId(null);
                              }
                            }}
                          >
                            {isTogglingLock
                              ? "..."
                              : proposal.is_locked
                                ? "Unlock"
                                : "Lock"}
                          </Button>
                        )}
                      </div>
                      {proposal.description && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {proposal.description}
                        </p>
                      )}
                      {proposal.rationale && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          <span className="font-medium">Rationale:</span>{" "}
                          {proposal.rationale}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {proposal.pi && (
                          <span>
                            <span className="font-medium">PI:</span> {proposal.pi}
                            {proposal.pi_email && (
                              <>
                                {" — "}
                                <a
                                  href={`mailto:${proposal.pi_email}`}
                                  className="underline hover:text-primary"
                                >
                                  {proposal.pi_email}
                                </a>
                              </>
                            )}
                          </span>
                        )}
                        {proposal.scientific_mentor && (
                          <span>
                            <span className="font-medium">Mentor/Collab:</span>{" "}
                            {proposal.scientific_mentor}
                            {proposal.mentor_email && (
                              <>
                                {" — "}
                                <a
                                  href={`mailto:${proposal.mentor_email}`}
                                  className="underline hover:text-primary"
                                >
                                  {proposal.mentor_email}
                                </a>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(proposal.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Community Issues Panel (read-only for non-admins) ----

function CommunityIssuesPanel({
  issues,
  profiles,
}: {
  issues: Issue[];
  profiles: ApprovedProfile[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Visible issues: hide closed from the community view by default
  const visibleIssues = issues.filter((i) => i.status !== "closed");

  return (
    <Card>
      <CardHeader>
        <CardTitle>To-Do / Issues</CardTitle>
        <CardDescription>
          {visibleIssues.length === 0
            ? "No open to-dos / issues."
            : `${visibleIssues.length} open to-do(s) / issue(s).`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visibleIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing active right now.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleIssues.map((issue) => {
              const isOpen = expanded.has(issue.id);
              const reporter = profileById.get(issue.reporter);
              const reporterName = reporter?.display_name || "—";
              const reporterEmail = reporter?.email || null;
              const reporterRole = reporter?.role
                ? roleLabel(reporter.role)
                : null;
              const assigneeProfile = issue.assignee
                ? profileById.get(issue.assignee)
                : null;
              const assigneeName = assigneeProfile?.display_name || "—";
              const assigneeEmail = assigneeProfile?.email || null;
              const assigneeRole = assigneeProfile?.role
                ? roleLabel(assigneeProfile.role)
                : null;
              return (
                <div
                  key={issue.id}
                  className="rounded-lg bg-muted/30 ring-1 ring-foreground/5"
                >
                  <button
                    type="button"
                    onClick={() => toggle(issue.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 p-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <p className="text-sm font-medium truncate">{issue.title}</p>
                        <Badge variant={statusVariant(issue.status)} className="text-xs">
                          {statusLabel(issue.status)}
                        </Badge>
                        <Badge variant={priorityVariant(issue.priority)} className="text-xs">
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`text-xs text-muted-foreground shrink-0 transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      ▸
                    </span>
                  </button>
                  <div className="px-2 pb-2 -mt-1 text-xs text-muted-foreground space-y-0.5">
                    <p className="truncate">
                      <span className="font-medium">Reporter:</span>{" "}
                      {reporterName}
                      {reporterEmail && (
                        <>
                          {" · "}
                          <a
                            href={`mailto:${reporterEmail}`}
                            className="underline hover:text-primary"
                          >
                            {reporterEmail}
                          </a>
                        </>
                      )}
                      {reporterRole && ` · ${reporterRole}`}
                    </p>
                    {issue.assignee && (
                      <p className="truncate">
                        <span className="font-medium">Assignee:</span>{" "}
                        {assigneeName}
                        {assigneeEmail && (
                          <>
                            {" · "}
                            <a
                              href={`mailto:${assigneeEmail}`}
                              className="underline hover:text-primary"
                            >
                              {assigneeEmail}
                            </a>
                          </>
                        )}
                        {assigneeRole && ` · ${assigneeRole}`}
                      </p>
                    )}
                  </div>
                  {isOpen && (
                    <div className="px-2 pb-2 pt-1 border-t border-foreground/5 space-y-1">
                      {issue.description && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {issue.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(issue.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Assigned Issues Panel (issues assigned TO the current user) ----

function AssignedIssuesPanel({
  issues,
  profiles,
  userId,
}: {
  issues: Issue[];
  profiles: ApprovedProfile[];
  userId: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Show issues assigned to me that are not closed
  const myAssigned = issues.filter(
    (i) => i.assignee === userId && i.status !== "closed"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned to Me</CardTitle>
        <CardDescription>
          {myAssigned.length === 0
            ? "Nothing assigned to you right now."
            : `${myAssigned.length} open item(s) assigned to you.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {myAssigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            When someone assigns a to-do or issue to you, it will show up here.
          </p>
        ) : (
          <div className="space-y-2">
            {myAssigned.map((issue) => {
              const isOpen = expanded.has(issue.id);
              const reporter = profileById.get(issue.reporter);
              const reporterName = reporter?.display_name || "—";
              const reporterEmail = reporter?.email || null;
              const reporterRole = reporter?.role ? roleLabel(reporter.role) : null;
              return (
                <div
                  key={issue.id}
                  className="rounded-lg bg-muted/30 ring-1 ring-foreground/5"
                >
                  <button
                    type="button"
                    onClick={() => toggle(issue.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 p-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <p className="text-sm font-medium truncate">{issue.title}</p>
                        <Badge variant={statusVariant(issue.status)} className="text-xs">
                          {statusLabel(issue.status)}
                        </Badge>
                        <Badge variant={priorityVariant(issue.priority)} className="text-xs">
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`text-xs text-muted-foreground shrink-0 transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      ▸
                    </span>
                  </button>
                  <div className="px-2 pb-2 -mt-1 text-xs text-muted-foreground">
                    <p className="truncate">
                      <span className="font-medium">Reporter:</span>{" "}
                      {reporterName}
                      {reporterEmail && (
                        <>
                          {" · "}
                          <a
                            href={`mailto:${reporterEmail}`}
                            className="underline hover:text-primary"
                          >
                            {reporterEmail}
                          </a>
                        </>
                      )}
                      {reporterRole && ` · ${reporterRole}`}
                    </p>
                  </div>
                  {isOpen && (
                    <div className="px-2 pb-2 pt-1 border-t border-foreground/5 space-y-1">
                      {issue.description && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {issue.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(issue.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
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

        // Fetch approved profiles for assignee dropdown and user list
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email, role, created_at")
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

        // Fetch profiles for submitter-name lookup in Projects panel
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email, role, created_at")
          .eq("approved", true);
        setApprovedProfiles(profiles || []);

        // Fetch all issues for community To-Do / Issues panel
        const { data: issues } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });
        setAllIssues(issues || []);

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
        // Fetch all issues for community To-Do / Issues panel
        const { data: issues } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });
        setAllIssues(issues || []);

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

        // Fetch community-approved proposals (approved by anyone — read-only view)
        const { data: approved } = await supabase
          .from("proposals")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        setViewerProposals(approved || []);

        // Fetch profiles for submitter-name lookup in Projects panel
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email, role, created_at")
          .eq("approved", true);
        setApprovedProfiles(profiles || []);
      } else if (role === "viewer" || role === "researcher") {
        // Viewers can only see approved proposals (RLS enforced)
        const { data: proposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        setViewerProposals(proposals || []);

        // Fetch all issues for community To-Do / Issues panel
        const { data: issues } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });
        setAllIssues(issues || []);

        // Fetch my proposals (researchers can now submit proposals)
        const { data: mProposals } = await supabase
          .from("proposals")
          .select("*")
          .eq("submitter", userId)
          .order("created_at", { ascending: false });
        setMyProposals(mProposals || []);

        // Fetch my issues (researchers can now submit issues)
        const { data: mIssues } = await supabase
          .from("issues")
          .select("*")
          .eq("reporter", userId)
          .order("created_at", { ascending: false });
        setMyIssues(mIssues || []);

        // Fetch profiles for submitter-name lookup in Projects panel
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email, role, created_at")
          .eq("approved", true);
        setApprovedProfiles(profiles || []);
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

  async function handleChangeRole(targetUserId: string, newRole: UserRole) {
    await supabase.from("profiles").update({ role: newRole }).eq("id", targetUserId);
  }

  async function handleUpdateIssue(
    issueId: string,
    updates: Partial<Pick<Issue, "status" | "assignee">>
  ) {
    await supabase.from("issues").update(updates).eq("id", issueId);
  }

  async function handleDeleteIssue(issueId: string) {
    await supabase.from("issues").delete().eq("id", issueId);
    fetchData();
  }

  async function handleDeleteProposal(proposalId: string) {
    await supabase.from("proposals").delete().eq("id", proposalId);
    fetchData();
  }

  async function handleUpdateProgress(
    proposalId: string,
    progress: ProjectProgress
  ) {
    const { error } = await supabase.rpc("update_project_progress", {
      proposal_id: proposalId,
      new_progress: progress,
    });
    if (error) {
      setError(`Failed to update progress: ${error.message}`);
      return;
    }
    fetchData();
  }

  async function handleToggleLock(proposalId: string, locked: boolean) {
    const { error } = await supabase.rpc("set_project_lock", {
      proposal_id: proposalId,
      locked,
    });
    if (error) {
      setError(`Failed to ${locked ? "lock" : "unlock"} project: ${error.message}`);
      return;
    }
    fetchData();
  }

  async function handleEditIssue(issueId: string, updates: { title: string; description: string | null }) {
    await supabase.from("issues").update(updates).eq("id", issueId);
    fetchData();
  }

  async function handleEditProposal(proposalId: string, updates: { title: string; description: string | null; rationale: string | null }) {
    await supabase.from("proposals").update(updates).eq("id", proposalId);
    fetchData();
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

    // Send email notification on approval
    if (status === "approved") {
      const proposal = allProposals.find((p) => p.id === proposalId);
      if (proposal) {
        try {
          await fetch("/api/proposals/notify-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              proposalId,
              proposalTitle: proposal.title,
              piName: proposal.pi,
              piEmail: proposal.pi_email,
              mentorName: proposal.scientific_mentor,
              mentorEmail: proposal.mentor_email,
              status,
              reviewComment: comment,
            }),
          });
        } catch {
          // Email failure should not block approval
        }
      }
    }
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
            onDeleteIssue={handleDeleteIssue}
            onRefresh={fetchData}
          />
          <ProposalReviewPanel
            proposals={allProposals}
            userId={userId}
            onReview={handleReviewProposal}
            onDeleteProposal={handleDeleteProposal}
            onRefresh={fetchData}
          />
          <ProjectsPanel
            proposals={allProposals.filter((p) => p.status === "approved")}
            profiles={approvedProfiles}
            userId={userId}
            role={role}
            onDelete={handleDeleteProposal}
            onUpdateProgress={handleUpdateProgress}
            onToggleLock={handleToggleLock}
          />
          <UserListPanel
            users={approvedProfiles}
            onChangeRole={handleChangeRole}
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
            onDeleteProposal={handleDeleteProposal}
            onRefresh={fetchData}
          />
          <ProjectsPanel
            proposals={allProposals.filter((p) => p.status === "approved")}
            profiles={approvedProfiles}
            userId={userId}
            role={role}
            onDelete={handleDeleteProposal}
            onUpdateProgress={handleUpdateProgress}
            onToggleLock={handleToggleLock}
          />
          <CommunityIssuesPanel issues={allIssues} profiles={approvedProfiles} />
          <MyIssuesPanel issues={myIssues} onDelete={handleDeleteIssue} onEdit={handleEditIssue} />
          <MyProposalsPanel proposals={myProposals} onDelete={handleDeleteProposal} onEdit={handleEditProposal} />
        </>
      )}

      {/* Developer panels */}
      {role === "developer" && (
        <>
          <ProjectsPanel
            proposals={viewerProposals}
            profiles={approvedProfiles}
            userId={userId}
            role={role}
            onDelete={handleDeleteProposal}
            onUpdateProgress={handleUpdateProgress}
            onToggleLock={handleToggleLock}
          />
          <CommunityIssuesPanel issues={allIssues} profiles={approvedProfiles} />
          <AssignedIssuesPanel issues={allIssues} profiles={approvedProfiles} userId={userId} />
          <MyIssuesPanel issues={myIssues} onDelete={handleDeleteIssue} onEdit={handleEditIssue} />
          <MyProposalsPanel proposals={myProposals} onDelete={handleDeleteProposal} onEdit={handleEditProposal} />
        </>
      )}

      {/* Researcher panels */}
      {(role === "viewer" || role === "researcher") && (
        <>
          <ProjectsPanel
            proposals={viewerProposals}
            profiles={approvedProfiles}
            userId={userId}
            role={role}
            onDelete={handleDeleteProposal}
            onUpdateProgress={handleUpdateProgress}
            onToggleLock={handleToggleLock}
          />
          <CommunityIssuesPanel issues={allIssues} profiles={approvedProfiles} />
          <MyIssuesPanel issues={myIssues} onDelete={handleDeleteIssue} onEdit={handleEditIssue} />
          <MyProposalsPanel proposals={myProposals} onDelete={handleDeleteProposal} onEdit={handleEditProposal} />
        </>
      )}

      {/* Common: My proposals for non-admin roles that aren't viewer */}
      {/* (already rendered above per role) */}
    </div>
  );
}
