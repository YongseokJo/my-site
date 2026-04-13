import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormData {
  display_name: string;
  email: string;
  password: string;
}

interface FormErrors {
  display_name?: string;
  email?: string;
  password?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

function validate(field: keyof FormData, value: string): string | undefined {
  if (field === "display_name" && !value.trim())
    return "Display name is required.";
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address.";
  if (field === "password" && value.length < 8)
    return "Password must be at least 8 characters.";
  return undefined;
}

export default function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    display_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState("");

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
    for (const field of ["display_name", "email", "password"] as const) {
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
      body.append("display_name", formData.display_name);
      body.append("email", formData.email);
      body.append("password", formData.password);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Registration failed. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-[400px] mx-auto text-center py-8">
        <h2 className="text-xl font-bold mb-3">Account Created</h2>
        <p className="text-muted-foreground">
          Check your email for a verification link. After verifying, your
          account will need admin approval before you can access collaboration
          features.
        </p>
        <a
          href="/login"
          className="inline-block mt-6 text-primary hover:underline"
        >
          Go to Sign In
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[400px] mx-auto space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="signup-name">Display Name</Label>
        <Input
          id="signup-name"
          name="display_name"
          type="text"
          required
          value={formData.display_name}
          onChange={(e) => handleChange("display_name", e.target.value)}
          onBlur={() => handleBlur("display_name")}
          aria-describedby={errors.display_name ? "name-error" : undefined}
          aria-invalid={!!errors.display_name}
        />
        {errors.display_name && (
          <p id="name-error" className="text-sm text-destructive mt-1">
            {errors.display_name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
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

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
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
        {status === "submitting" ? "Creating Account..." : "Sign Up"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
