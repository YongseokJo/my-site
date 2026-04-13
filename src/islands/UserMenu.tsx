import { Button } from "@/components/ui/button";

interface UserMenuProps {
  initialUser: { email: string; displayName: string } | null;
}

export default function UserMenu({ initialUser }: UserMenuProps) {
  if (!initialUser) {
    return (
      <a href="/login">
        <Button variant="outline" size="sm">
          Login / Sign Up
        </Button>
      </a>
    );
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {initialUser.displayName || initialUser.email}
      </span>
      <a href="/dashboard">
        <Button variant="outline" size="sm">
          Dashboard
        </Button>
      </a>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
