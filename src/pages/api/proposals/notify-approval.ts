export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";
import { createSupabaseServerClient } from "../../../lib/supabase";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  // Verify the caller is an admin/co_admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "co_admin", "pi_mentor"].includes(profile.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const body = await request.json();
  const { proposalId, proposalTitle, piName, piEmail, mentorName, mentorEmail, status, reviewComment } = body;

  if (!proposalId || !status) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  if (status !== "approved") {
    return new Response(JSON.stringify({ message: "No email sent for non-approval status" }), { status: 200 });
  }

  const emails: { to: string; name: string }[] = [];
  if (piEmail) emails.push({ to: piEmail, name: piName || "PI" });
  if (mentorEmail) emails.push({ to: mentorEmail, name: mentorName || "Mentor" });

  const results = [];

  for (const recipient of emails) {
    try {
      const { data, error } = await resend.emails.send({
        from: "Enzo-Abyss <me@yongseokjo.com>",
        to: [recipient.to],
        subject: `Project Proposal Approved: ${proposalTitle}`,
        html: `
          <h2>Project Proposal Approved</h2>
          <p>Dear ${recipient.name},</p>
          <p>The following project proposal has been approved:</p>
          <blockquote style="border-left: 3px solid #d4a54a; padding-left: 12px; margin: 16px 0;">
            <strong>${proposalTitle}</strong>
          </blockquote>
          ${reviewComment ? `<p><strong>Review comment:</strong> ${reviewComment}</p>` : ""}
          <p>You are listed as a ${recipient.to === piEmail ? "Principal Investigator" : "Scientific Mentor"} for this project.</p>
          <p>If you do not wish to serve in this role, please respond to this email to let us know.</p>
          <br>
          <p>Best regards,<br>Enzo-Abyss Team</p>
        `,
      });

      if (error) {
        results.push({ to: recipient.to, success: false, error: error.message });
      } else {
        results.push({ to: recipient.to, success: true, id: data?.id });
      }
    } catch (err) {
      results.push({ to: recipient.to, success: false, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
