import { LEARN_URL, STUDIO_URL } from "@/lib/site";

const FROM = () => process.env.MAIL_FROM?.trim();
const KEY = () => process.env.RESEND_API_KEY?.trim();

export function mailConfigured(): boolean {
  return Boolean(KEY() && FROM());
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const key = KEY();
  const from = FROM();
  if (!key || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and MAIL_FROM.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body.slice(0, 240)}`);
  }
}

export function welcomeEmail(name: string | null | undefined, to: string) {
  const first = name?.trim().split(/\s+/)[0] || "there";
  const studio = STUDIO_URL;
  const subject = `${first}, your minsuro studio is ready`;
  const text = [
    `Hi ${first},`,
    "",
    "Welcome to minsuro — 20 free credits are on your account. Describe a scene and get it back in about thirty seconds. When they run out, top up in the studio.",
    "",
    `Open the studio: ${studio}`,
    `Prompting lessons: ${LEARN_URL}`,
    "",
    "See you in the queue.",
    "— minsuro",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07070a;color:#f7f8fb;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07070a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:8px 4px 28px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#ffd426;">
                minsuro
              </td>
            </tr>
            <tr>
              <td style="font-size:32px;line-height:1.15;letter-spacing:-0.03em;">
                Hi ${escapeHtml(first)}. Your studio is ready.
              </td>
            </tr>
            <tr>
              <td style="padding-top:18px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#a2a7b4;">
                Describe a scene. Pick a model. Hit generate. You have 20 free credits to start — top up in the studio when they run out.
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;">
                <a href="${escapeHtml(studio)}" style="display:inline-block;background:#ffd426;color:#14140a;text-decoration:none;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;font-weight:700;padding:14px 22px;border-radius:999px;">
                  Open the studio
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:36px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;color:#6d7280;">
                You signed up for minsuro with ${escapeHtml(to)}. This is a one-time welcome — not a drip.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
