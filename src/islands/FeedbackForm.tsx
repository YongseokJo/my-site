import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FormData {
  category: string;
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  category?: string;
  name?: string;
  email?: string;
  message?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

function validate(field: keyof FormData, value: string): string | undefined {
  if (field === "category" && !value) return "Please select a category.";
  if (field === "name" && !value.trim()) return "Name is required.";
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address.";
  if (field === "message" && value.trim().length < 10)
    return "Message must be at least 10 characters.";
  return undefined;
}

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FormData>({
    category: "",
    name: "",
    email: "",
    message: "",
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
    for (const field of ["category", "name", "email", "message"] as const) {
      const err = validate(field, formData[field]);
      if (err) newErrors[field] = err;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch(
        "https://formspree.io/f/mpqkzyre",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            category: formData.category,
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }),
        }
      );
      if (!response.ok) throw new Error("Submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold mb-2">Feedback Received</h2>
        <p className="text-muted-foreground">
          Thank you for your feedback. Your input helps make Readea better.
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
        <Label htmlFor="feedback-category">Category</Label>
        <Select
          value={formData.category || undefined}
          onValueChange={(value) => {
            handleChange("category", value as string);
          }}
        >
          <SelectTrigger
            id="feedback-category"
            className="w-full"
            aria-describedby={
              errors.category ? "feedback-category-error" : undefined
            }
            aria-invalid={!!errors.category}
            onBlur={() => handleBlur("category")}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bug Report">Bug Report</SelectItem>
            <SelectItem value="Feature Request">Feature Request</SelectItem>
            <SelectItem value="General Feedback">General Feedback</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p
            id="feedback-category-error"
            className="text-sm text-destructive mt-1"
          >
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="feedback-name">Name</Label>
        <Input
          id="feedback-name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          aria-describedby={errors.name ? "feedback-name-error" : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p id="feedback-name-error" className="text-sm text-destructive mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="feedback-email">Email</Label>
        <Input
          id="feedback-email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          aria-describedby={errors.email ? "feedback-email-error" : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p
            id="feedback-email-error"
            className="text-sm text-destructive mt-1"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="feedback-message">Message</Label>
        <Textarea
          id="feedback-message"
          name="message"
          required
          className="min-h-[120px]"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          aria-describedby={
            errors.message ? "feedback-message-error" : undefined
          }
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p
            id="feedback-message-error"
            className="text-sm text-destructive mt-1"
          >
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-primary text-primary-foreground"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : "Send Feedback"}
        </Button>
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive mt-4">
          Something went wrong. Please try again, or reach out via the contact
          page.
        </p>
      )}
    </form>
  );
}
