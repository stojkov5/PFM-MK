// server/lib/mailer.js
// Sends email through Resend's HTTP API (https://resend.com). Railway blocks
// outbound SMTP on the Hobby plan, so an HTTPS email API is used instead of
// logging in to the info@npf.mk mailbox. Replies go to MAIL_REPLY_TO, so
// clubs' answers still arrive in that mailbox.
//
// Without RESEND_API_KEY emails are only printed to the console — reported as
// sent in local dev, as failed in production (so the admin panel warns).

const DEFAULT_ADDRESS = "info@npf.mk";

export const mailSettings = () => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.MAIL_FROM || `Национална пливачка федерација <${DEFAULT_ADDRESS}>`,
  replyTo: process.env.MAIL_REPLY_TO || DEFAULT_ADDRESS,
  // Where notifications about new submissions go.
  federation: process.env.FEDERATION_EMAIL || DEFAULT_ADDRESS,
});

/**
 * send({ to, subject, text, html }) resolves to true when the email was sent
 * (or printed in dev) and false when sending failed. It never throws, so a
 * mail outage doesn't break the action that triggered it.
 */
export const createMailer = (settings = mailSettings()) => ({
  federation: settings.federation,
  async send({ to, subject, text, html }) {
    const recipients = [...new Set([to].flat().filter(Boolean))];
    if (recipients.length === 0) return false;

    if (!settings.apiKey) {
      console.log(`[pfm] email (not sent, RESEND_API_KEY unset) to ${recipients.join(", ")}: ${subject}\n${text}`);
      return process.env.NODE_ENV !== "production";
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: settings.from,
          to: recipients,
          reply_to: settings.replyTo,
          subject,
          text,
          html,
        }),
      });
      if (!res.ok) {
        console.error(`[pfm] email to ${recipients.join(", ")} failed: ${res.status} ${await res.text()}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`[pfm] email to ${recipients.join(", ")} failed:`, err);
      return false;
    }
  },
});
