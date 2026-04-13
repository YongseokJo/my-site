import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

function validate(field: keyof FormData, value: string): string | undefined {
  if (field === "name" && !value.trim()) return "Name is required.";
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address.";
  return undefined;
}

export default function BetaSignupForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

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
    for (const field of ["name", "email"] as const) {
      const err = validate(field, formData[field]);
      if (err) newErrors[field] = err;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch("https://formspree.io/f/mgorenyq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      if (!response.ok) throw new Error("Submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold mb-2">You're on the List</h2>
        <p className="text-muted-foreground">
          Thank you for signing up. You will receive beta access information via email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[500px] mx-auto space-y-4"
      noValidate
    >
      <div>
        <Label htmlFor="beta-name">Name</Label>
        <Input
          id="beta-name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          aria-describedby={errors.name ? "beta-name-error" : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p id="beta-name-error" className="text-sm text-destructive mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="beta-email">Email</Label>
        <Input
          id="beta-email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          aria-describedby={errors.email ? "beta-email-error" : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="beta-email-error" className="text-sm text-destructive mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-primary text-primary-foreground"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Signing up..." : "Sign Up"}
        </Button>
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive mt-4">
          Something went wrong. Please try again, or reach out via the contact page.
        </p>
      )}
    </form>
  );
}
