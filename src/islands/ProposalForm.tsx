import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface ProposalFormData {
  title: string;
  description: string;
  rationale: string;
  pi: string;
  pi_email: string;
  scientific_mentor: string;
  mentor_email: string;
  position: string;
  affiliation: string;
  basic_profile: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  rationale?: string;
  pi?: string;
  pi_email?: string;
  scientific_mentor?: string;
  mentor_email?: string;
  position?: string;
  affiliation?: string;
  basic_profile?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

function validate(
  field: keyof ProposalFormData,
  value: string
): string | undefined {
  const trimmed = value.trim();
  switch (field) {
    case "title":
      if (trimmed.length < 5) return "Title must be at least 5 characters.";
      break;
    case "description":
      if (trimmed.length < 20)
        return "Description must be at least 20 characters.";
      break;
    case "rationale":
      if (trimmed.length < 20)
        return "Rationale must be at least 20 characters.";
      break;
    case "pi":
      if (!trimmed) return "Principal Investigator is required.";
      break;
    case "pi_email":
      if (!trimmed) return "PI email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Invalid email address.";
      break;
    case "scientific_mentor":
      if (!trimmed) return "Scientific mentor is required.";
      break;
    case "mentor_email":
      if (!trimmed) return "Mentor email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Invalid email address.";
      break;
    case "position":
      if (!trimmed) return "Position is required.";
      break;
    case "affiliation":
      if (!trimmed) return "Affiliation is required.";
      break;
    case "basic_profile":
      break;
  }
  return undefined;
}

const allFields: (keyof ProposalFormData)[] = [
  "title",
  "description",
  "rationale",
  "pi",
  "pi_email",
  "scientific_mentor",
  "mentor_email",
  "position",
  "affiliation",
  "basic_profile",
];

export default function ProposalForm() {
  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    rationale: "",
    pi: "",
    pi_email: "",
    scientific_mentor: "",
    mentor_email: "",
    position: "",
    affiliation: "",
    basic_profile: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState("");

  function handleBlur(field: keyof ProposalFormData) {
    const err = validate(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function handleChange(field: keyof ProposalFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const err = validate(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};
    for (const field of allFields) {
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
        setServerError("You must be logged in to submit a proposal.");
        setStatus("error");
        return;
      }

      const { error } = await supabase.from("proposals").insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        rationale: formData.rationale.trim(),
        pi: formData.pi.trim(),
        scientific_mentor: formData.scientific_mentor.trim(),
        position: formData.position.trim(),
        basic_profile: formData.basic_profile.trim(),
        submitter: user.id,
      });

      if (error) {
        setServerError(error.message);
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({
        title: "",
        description: "",
        rationale: "",
        pi: "",
        scientific_mentor: "",
        position: "",
        basic_profile: "",
      });
      window.dispatchEvent(new CustomEvent("proposal-created"));
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <h3 className="text-xl font-bold mb-2">Proposal Submitted</h3>
        <p className="text-muted-foreground">
          Proposal submitted successfully. It will be reviewed by a PI or
          mentor.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => setStatus("idle")}
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6"
      noValidate
    >
      <h3 className="text-lg font-semibold">Submit a Proposal</h3>

      {/* Project Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Project Details
        </h4>

        <div className="space-y-2">
          <Label htmlFor="proposal-title">Title</Label>
          <Input
            id="proposal-title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            aria-describedby={errors.title ? "prop-title-error" : undefined}
            aria-invalid={!!errors.title}
            placeholder="Project title"
          />
          {errors.title && (
            <p id="prop-title-error" className="text-sm text-destructive mt-1">
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-description">Description</Label>
          <Textarea
            id="proposal-description"
            name="description"
            required
            className="min-h-[100px]"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            aria-describedby={
              errors.description ? "prop-desc-error" : undefined
            }
            aria-invalid={!!errors.description}
            placeholder="Detailed description of the proposed project"
          />
          {errors.description && (
            <p id="prop-desc-error" className="text-sm text-destructive mt-1">
              {errors.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-rationale">Rationale</Label>
          <Textarea
            id="proposal-rationale"
            name="rationale"
            required
            className="min-h-[80px]"
            value={formData.rationale}
            onChange={(e) => handleChange("rationale", e.target.value)}
            onBlur={() => handleBlur("rationale")}
            aria-describedby={
              errors.rationale ? "prop-rationale-error" : undefined
            }
            aria-invalid={!!errors.rationale}
            placeholder="Why this project matters"
          />
          {errors.rationale && (
            <p
              id="prop-rationale-error"
              className="text-sm text-destructive mt-1"
            >
              {errors.rationale}
            </p>
          )}
        </div>
      </div>

      {/* Academic Context */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Academic Context
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-pi">Principal Investigator</Label>
            <Input
              id="proposal-pi"
              name="pi"
              type="text"
              required
              value={formData.pi}
              onChange={(e) => handleChange("pi", e.target.value)}
              onBlur={() => handleBlur("pi")}
              aria-describedby={errors.pi ? "prop-pi-error" : undefined}
              aria-invalid={!!errors.pi}
              placeholder="Name of the PI"
            />
            {errors.pi && (
              <p id="prop-pi-error" className="text-sm text-destructive mt-1">{errors.pi}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposal-pi-email">PI Email</Label>
            <Input
              id="proposal-pi-email"
              name="pi_email"
              type="email"
              required
              value={formData.pi_email}
              onChange={(e) => handleChange("pi_email", e.target.value)}
              onBlur={() => handleBlur("pi_email")}
              aria-describedby={errors.pi_email ? "prop-pi-email-error" : undefined}
              aria-invalid={!!errors.pi_email}
              placeholder="PI's email address"
            />
            {errors.pi_email && (
              <p id="prop-pi-email-error" className="text-sm text-destructive mt-1">{errors.pi_email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-mentor">Scientific Mentor</Label>
            <Input
              id="proposal-mentor"
              name="scientific_mentor"
              type="text"
              required
              value={formData.scientific_mentor}
              onChange={(e) => handleChange("scientific_mentor", e.target.value)}
              onBlur={() => handleBlur("scientific_mentor")}
              aria-describedby={errors.scientific_mentor ? "prop-mentor-error" : undefined}
              aria-invalid={!!errors.scientific_mentor}
              placeholder="Name of the scientific mentor"
            />
            {errors.scientific_mentor && (
              <p id="prop-mentor-error" className="text-sm text-destructive mt-1">{errors.scientific_mentor}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposal-mentor-email">Mentor Email</Label>
            <Input
              id="proposal-mentor-email"
              name="mentor_email"
              type="email"
              required
              value={formData.mentor_email}
              onChange={(e) => handleChange("mentor_email", e.target.value)}
              onBlur={() => handleBlur("mentor_email")}
              aria-describedby={errors.mentor_email ? "prop-mentor-email-error" : undefined}
              aria-invalid={!!errors.mentor_email}
              placeholder="Mentor's email address"
            />
            {errors.mentor_email && (
              <p id="prop-mentor-email-error" className="text-sm text-destructive mt-1">{errors.mentor_email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-position">Position</Label>
            <Input
              id="proposal-position"
              name="position"
              type="text"
              required
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              onBlur={() => handleBlur("position")}
              aria-describedby={errors.position ? "prop-position-error" : undefined}
              aria-invalid={!!errors.position}
              placeholder="Your position or title"
            />
            {errors.position && (
              <p id="prop-position-error" className="text-sm text-destructive mt-1">{errors.position}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposal-affiliation">Affiliation</Label>
            <Input
              id="proposal-affiliation"
              name="affiliation"
              type="text"
              required
              value={formData.affiliation}
              onChange={(e) => handleChange("affiliation", e.target.value)}
              onBlur={() => handleBlur("affiliation")}
              aria-describedby={errors.affiliation ? "prop-affiliation-error" : undefined}
              aria-invalid={!!errors.affiliation}
              placeholder="University or institution"
            />
            {errors.affiliation && (
              <p id="prop-affiliation-error" className="text-sm text-destructive mt-1">{errors.affiliation}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-profile">Basic Profile <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="proposal-profile"
            name="basic_profile"
            className="min-h-[80px]"
            value={formData.basic_profile}
            onChange={(e) => handleChange("basic_profile", e.target.value)}
            placeholder="Brief academic profile and relevant background"
          />
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        className="bg-primary text-primary-foreground"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Submit Proposal"}
      </Button>
    </form>
  );
}
