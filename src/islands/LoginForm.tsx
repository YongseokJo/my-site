import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

type FormStatus = "idle" | "submitting" | "error";

function validate(field: keyof FormData, value: string): string | undefined {
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address.";
  if (field === "password" && value.length < 6)
    return "Password must be at least 6 characters.";
  return undefined;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "pending_approval") {
      setPendingMessage(
        "Your account is pending admin approval. You will be notified when approved."
      );
    }
    const redirect = params.get("redirect");
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  function handleBlur(field: keyof FormData) {
    const err = validate(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const err = validate(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};
    for (const field of ["email", "password"] as const) {
      const err = validate(field, formData[field]);
      if (err) newErrors[field] = err;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("submitting");
    setServerError("");

    try {
      const body = new FormData();
      body.append("email", formData.email);
      body.append("password", formData.password);

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || "Login failed. Please try again.");
        setStatus("error");
        return;
      }

      window.location.href = redirectUrl;
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[400px] mx-auto space-y-4"
      noValidate
    >
      {pendingMessage && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          {pendingMessage}
        </div>
      )}

      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={() => handleBlur("password")}
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        No account?{" "}
        <a href="/signup" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
