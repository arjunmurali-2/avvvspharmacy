import 'server-only';
import nodemailer from 'nodemailer';

// Mail to the pharmacy, using the same SMTP settings as web/. Silently skipped when not configured.
export async function mailPharmacy(subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const to = process.env.MAIL_TO;
  if (!host || !to) return false;
  const t = nodemailer.createTransport({
    host, port: Number(process.env.SMTP_PORT || 465), secure: process.env.SMTP_SECURE !== 'false',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text });
  return true;
}
