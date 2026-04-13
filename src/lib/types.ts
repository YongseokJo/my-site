export type UserRole = "admin" | "pi_mentor" | "developer" | "viewer";

export interface UserProfile {
  id: string;
  display_name: string | null;
  role: UserRole;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export type IssuePriority = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "closed";
export type ProposalStatus = "pending" | "approved" | "rejected";
