// Reusable Nodemailer wrapper.
//
// SMTP credentials come from .env (see .env.example):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE
//
// If SMTP is not configured, sendMail() logs a warning and resolves without
// throwing — so any caller that fires-and-forgets never breaks because of
// missing mail credentials (e.g. the property-creation flow).

const nodemailer = require('nodemailer');

let transporter = null;
let transporterChecked = false;

const getTransporter = () => {
  if (transporter || transporterChecked) return transporter;
  transporterChecked = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP not configured – emails will be skipped.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
};

/**
 * Send an email. Never throws — safe to fire-and-forget.
 *
 * @param {object} opts
 * @param {string|string[]} opts.to       – recipient(s)
 * @param {string}          opts.subject  – subject line
 * @param {string}          [opts.html]   – HTML body
 * @param {string}          [opts.text]   – plaintext fallback
 */
async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) return { skipped: true };

  try {
    const from = process.env.SMTP_FROM || `Telvine Realty <${process.env.SMTP_USER}>`;
    const info = await tx.sendMail({ from, to, subject, html, text });
    return { messageId: info.messageId };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { sendMail, getTransporter };
