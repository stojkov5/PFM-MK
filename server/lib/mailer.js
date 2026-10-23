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

  /**
   * sendEach(recipients, mail) sends an email to each address separately
   * (nobody sees the other recipients), in batches of 100 through Resend's
   * batch API. `mail` is { subject, text, html }, or a function of the address
   * returning one (e.g. for a personal unsubscribe link). Resolves to the
   * number of addresses it reached. Never throws.
   */
  async sendEach(to, mail) {
    const recipients = [...new Set([to].flat().filter(Boolean))];
    if (recipients.length === 0) return 0;
    const mailFor = typeof mail === "function" ? mail : () => mail;
    const { subject, text } = mailFor(recipients[0]);

    if (!settings.apiKey) {
      console.log(
        `[pfm] email (not sent, RESEND_API_KEY unset) to ${recipients.length} addresses: ${subject}\n${text}`
      );
      return process.env.NODE_ENV !== "production" ? recipients.length : 0;
    }

    const BATCH = 100;
    let delivered = 0;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const chunk = recipients.slice(i, i + BATCH);
      // Resend allows 2 requests a second by default.
      if (i > 0) await new Promise((r) => setTimeout(r, 600));
      try {
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            chunk.map((addr) => ({
              from: settings.from,
              to: [addr],
              reply_to: settings.replyTo,
              ...mailFor(addr),
            }))
          ),
        });
        if (!res.ok) {
          console.error(`[pfm] batch email (${chunk.length}) failed: ${res.status} ${await res.text()}`);
          continue;
        }
        delivered += chunk.length;
      } catch (err) {
        console.error(`[pfm] batch email (${chunk.length}) failed:`, err);
      }
    }
    return delivered;
  },
});
