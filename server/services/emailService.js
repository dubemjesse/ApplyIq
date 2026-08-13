const nodemailer = require("nodemailer");

let transport;
function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const err = new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — email sending is unavailable");
    err.status = 503;
    throw err;
  }

  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transport;
}

/**
 * @param {{ to: string, subject: string, html?: string, text?: string }} message
 */
async function sendEmail(message) {
  return getTransport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    ...message,
  });
}

module.exports = { getTransport, sendEmail };
