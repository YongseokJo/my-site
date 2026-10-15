import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;
    supabase.auth.getUser()
      .then(({ data }) => {
        if (mounted) setEmail(data.user?.email ?? null);
      })
      .catch(() => {
        if (mounted) setEmail(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.reload();
  }

  if (loading) {
    return <a href="/dashboard" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Open Dashboard</a>;
  }

  if (!email) {
    return (
      <a href="/login" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Login / Sign Up</a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {email}
      </span>
      <a href="/dashboard" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Dashboard</a>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
