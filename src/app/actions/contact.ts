"use server";

import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "name_too_short").max(120, "name_too_long"),
  email: z.email("email_invalid"),
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, "message_too_short")
    .max(5000, "message_too_long"),
});

export type ContactFieldErrors = Partial<{
  name: string;
  email: string;
  subject: string;
  message: string;
}>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: ContactFieldErrors;
};

// Escape user-provided strings before injecting them into HTML
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): string {
  const displaySubject = subject ?? `Nouveau message de ${name}`;
  // Preserve newlines from textarea; rest is escaped.
  const safeMessage = esc(message).replace(/\n/g, "<br>");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(displaySubject)}</title>
</head>
<body style="margin:0;padding:0;background:#010c1f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#fcfcfb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010c1f;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#021838;border-radius:16px;overflow:hidden;border:1px solid #18223a;">

        <!-- Header -->
        <tr><td style="padding:32px 32px 8px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#00a29a;font-family:'SF Mono','Menlo','Courier New',monospace;">
            <span style="display:inline-block;width:8px;height:8px;background:#00a29a;border-radius:50%;vertical-align:middle;margin-right:8px;"></span>Portfolio &middot; Nouveau message
          </p>
          <h1 style="margin:16px 0 0 0;font-size:22px;line-height:1.35;color:#fcfcfb;font-weight:700;">
            ${esc(displaySubject)}
          </h1>
        </td></tr>

        <!-- Sender card -->
        <tr><td style="padding:24px 32px 16px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010c1f;border:1px solid #18223a;border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9ba4b2;font-family:'SF Mono','Menlo','Courier New',monospace;">De</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#fcfcfb;">${esc(name)}</p>
              <p style="margin:6px 0 0 0;font-size:14px;">
                <a href="mailto:${esc(email)}" style="color:#5bccc4;text-decoration:none;">${esc(email)}</a>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Message -->
        <tr><td style="padding:0 32px 32px 32px;">
          <p style="margin:0 0 12px 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9ba4b2;font-family:'SF Mono','Menlo','Courier New',monospace;">Message</p>
          <div style="font-size:15px;line-height:1.7;color:#fcfcfb;">
            ${safeMessage}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#010c1f;border-top:1px solid #18223a;">
          <p style="margin:0;font-size:11px;line-height:1.6;color:#4a5366;font-family:'SF Mono','Menlo','Courier New',monospace;">
            Envoy&eacute; depuis <a href="${esc(SITE.url)}" style="color:#5bccc4;text-decoration:none;">wilfriedbrown.dev</a> &middot; R&eacute;ponds directement &agrave; cet email pour contacter ${esc(name)}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderText({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): string {
  return [
    `Nouveau message — Portfolio`,
    ``,
    `De   : ${name} <${email}>`,
    subject ? `Sujet: ${subject}` : null,
    ``,
    `Message:`,
    message,
    ``,
    `—`,
    `Envoyé depuis ${SITE.url}`,
    `Réponds directement à cet email pour contacter ${name}.`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactFieldErrors;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "validation_failed", fieldErrors };
  }

  const payload = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  // `||` so empty-string env vars fall back (a `.env` line `VAR=` reads as "")
  const from = process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>";
  const to = process.env.CONTACT_RECIPIENT || SITE.email;

  if (!apiKey) {
    console.log("[contact:dry-run] No RESEND_API_KEY set. Payload:", {
      to,
      from,
      ...payload,
    });
    return { status: "success", message: "dry_run" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: payload.subject ?? `Nouveau message de ${payload.name}`,
      html: renderHtml(payload),
      text: renderText(payload),
    });
    if (error) {
      console.error("[contact] Resend returned error:", error);
      return { status: "error", message: "send_failed" };
    }
    return { status: "success" };
  } catch (e) {
    console.error("[contact] send threw:", e);
    return { status: "error", message: "send_failed" };
  }
}
