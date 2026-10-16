import { Resend } from "resend";

const from =
  process.env.EMAIL_FROM?.trim() || "Manhuabk <onboarding@resend.dev>";

function appUrl(): string {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Lien de confirmation (route serveur qui valide le jeton puis redirige). */
export function verificationLink(token: string): string {
  return `${appUrl()}/api/v1/auth/verify?token=${encodeURIComponent(token)}`;
}

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export interface SendResult {
  sent: boolean;
  error?: string;
}

/**
 * Envoie l'e-mail de confirmation. Côté serveur uniquement.
 * Ne journalise jamais le jeton. Si RESEND_API_KEY est absent,
 * n'essaie pas d'envoyer et le signale honnêtement (sent: false).
 */
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<SendResult> {
  const resend = getClient();
  if (!resend) {
    // Pas de clé configurée → on n'invente pas d'envoi.
    console.warn("[email] RESEND_API_KEY absent — e-mail de confirmation non envoyé.");
    return { sent: false, error: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: "Confirme ton adresse e-mail — Manhuabk",
      html: verificationHtml(token),
      text: verificationText(token),
    });
    if (error) {
      console.error("[email] échec Resend", { code: error.name });
      return { sent: false, error: error.name };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] exception envoi", {
      err: err instanceof Error ? err.message : String(err),
    });
    return { sent: false, error: "SEND_EXCEPTION" };
  }
}

function verificationText(token: string): string {
  return [
    "Bonjour,",
    "",
    "Merci de t'être inscrit sur Manhuabk !",
    "",
    "Pour terminer ton inscription et activer ton compte, ouvre ce lien :",
    verificationLink(token),
    "",
    "Si tu n'es pas à l'origine de cette inscription, ignore ce message.",
    "",
    "L'équipe Manhuabk.",
  ].join("\n");
}

function verificationHtml(token: string): string {
  const link = verificationLink(token);
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#111018;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111018;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1B1924;border:1px solid #2c2740;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#8B35E8,#5b21b6);padding:26px 28px;">
              <div style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">Manhuabk</div>
              <div style="font-size:13px;color:#e9d5ff;margin-top:4px;">Confirme ton adresse e-mail</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#e7e4f0;">Bonjour,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#c9c5da;">
                Merci de t'être inscrit sur Manhuabk&nbsp;! Pour terminer ton inscription et activer ton compte, clique sur le bouton ci-dessous.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
                <tr>
                  <td style="background:#8B35E8;border-radius:10px;">
                    <a href="${link}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">
                      Confirmer mon adresse e-mail
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#8b86a0;">
                Ce lien est unique, sécurisé et expire dans 24&nbsp;heures.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#8b86a0;">
                Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur&nbsp;:<br/>
                <span style="word-break:break-all;color:#a78bfa;">${link}</span>
              </p>
              <hr style="border:none;border-top:1px solid #2c2740;margin:24px 0 16px;" />
              <p style="margin:0;font-size:13px;color:#8b86a0;">
                Si tu n'es pas à l'origine de cette inscription, ignore ce message.<br/>
                L'équipe Manhuabk.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
