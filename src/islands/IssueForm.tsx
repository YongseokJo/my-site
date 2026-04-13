import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { IssuePriority } from "@/lib/types";

interface IssueFormData {
  title: string;
  description: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

function validate(
  field: keyof IssueFormData,
  value: string
): string | undefined {
  if (field === "title" && value.trim().length < 5)
    return "Title must be at least 5 characters.";
  if (field === "description" && value.trim().length < 10)
    return "Description must be at least 10 characters.";
  return undefined;
}

export default function IssueForm() {
  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
  });
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState("");

  function handleBlur(field: keyof IssueFormData) {
    const err = validate(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function handleChange(field: keyof IssueFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const err = validate(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};
    for (const field of ["title", "description"] as const) {
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
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setServerError("You must be logged in to submit an issue.");
        setStatus("error");
        return;
      }

      const { error } = await supabase.from("issues").insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority,
        reporter: user.id,
      });

      if (error) {
        setServerError(error.message);
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ title: "", description: "" });
      setPriority("medium");
      window.dispatchEvent(new CustomEvent("issue-created"));

      // Reset form after a brief success display
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[500px] space-y-6"
      noValidate
    >
      <h3 className="text-lg font-semibold">Report a To-Do / Issue</h3>

      {status === "success" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          Issue submitted successfully.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="issue-title">Title</Label>
        <Input
          id="issue-title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={() => handleBlur("title")}
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={!!errors.title}
          placeholder="Brief summary of the issue"
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive mt-1">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issue-description">Description</Label>
        <Textarea
          id="issue-description"
          name="description"
          required
          className="min-h-[100px]"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          aria-invalid={!!errors.description}
          placeholder="Detailed description of the issue"
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive mt-1">
            {errors.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={(val) => setPriority(val as IssuePriority)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        className="bg-primary text-primary-foreground"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Submit To-Do / Issue"}
      </Button>
    </form>
  );
}
