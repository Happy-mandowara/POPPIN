import nodemailer, { type Transporter } from "nodemailer";
import { AppError } from "@/lib/http/response";

let mailTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;

  if (!user || !user.trim() || !pass || !pass.trim()) {
    throw new AppError(
      "Brevo SMTP credentials are not configured. Please add BREVO_SMTP_USER and BREVO_SMTP_KEY to .env.local",
      500,
      "EMAIL_CONFIG_MISSING"
    );
  }

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  }

  return mailTransporter;
}

export function getFromEmail(): string {
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!senderEmail) {
    throw new AppError(
      "Brevo sender email is not configured. Please add BREVO_SENDER_EMAIL to .env.local",
      500,
      "EMAIL_CONFIG_MISSING"
    );
  }

  return senderEmail.includes("<") ? senderEmail : `Poppin <${senderEmail}>`;
}

function isTestEnvironmentForEmail(cleanTo: string): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.IS_TEST_ENV === "true" ||
    cleanTo.endsWith("@example.com") ||
    cleanTo.endsWith("@test.com") ||
    cleanTo.endsWith("@poppin.io") ||
    cleanTo.endsWith("@poppin.test")
  );
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send a transactional email via Brevo SMTP using Nodemailer.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ id: string }> {
  const transporter = getTransporter();
  const from = getFromEmail();

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    if (!info || !info.messageId) {
      throw new AppError(
        "SMTP email dispatch returned an empty message ID.",
        502,
        "EMAIL_DELIVERY_FAILED"
      );
    }

    return { id: info.messageId };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError(
      `Email service communication failed: ${message}`,
      502,
      "EMAIL_SERVICE_ERROR"
    );
  }
}

interface SendVerificationOtpOptions {
  to: string;
  otp: string;
  displayName?: string | null;
}

/**
 * Generate a responsive, dark-mode POPPIN email template for OTP verification.
 */
function buildOtpEmailHtml(otp: string, displayName?: string | null): string {
  const greeting = displayName ? `Hi ${displayName},` : "Welcome to POPPIN,";
  const formattedOtp = otp.split("").join(" ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your POPPIN Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f2f3f5;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0d14; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e1f22; border-radius: 16px; border: 1px solid #35373c; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center; border-bottom: 1px solid #2b2d31;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background-color: #5865F2; width: 40px; height: 40px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="font-weight: 900; font-size: 20px; color: #ffffff; line-height: 40px;">P</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">POPPIN<span style="color: #5865F2;">.</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center;">Verify Your Email Address</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b5bac1; text-align: center;">
                ${greeting} please use the verification code below to confirm your account and get started on POPPIN.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #111214; border: 1px solid #5865F2; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
                <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; display: block;">
                  ${formattedOtp}
                </span>
              </div>

              <!-- Security Details -->
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #949ba4; text-align: center;">
                ⏳ This code is valid for <strong>10 minutes</strong> and can only be used once.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #80848e; text-align: center;">
                If you did not request this email, no further action is required. You can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #17181b; border-top: 1px solid #2b2d31; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6d737e;">
                &copy; ${new Date().getFullYear()} POPPIN Platform. Crafted for builders & creators.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send a 6-digit OTP verification email via Brevo SMTP.
 */
export async function sendVerificationOtpEmail({
  to,
  otp,
  displayName,
}: SendVerificationOtpOptions): Promise<{ id: string }> {
  const cleanTo = to.trim().toLowerCase();

  if (isTestEnvironmentForEmail(cleanTo)) {
    return { id: `mock-test-email-id-${Date.now()}` };
  }

  const html = buildOtpEmailHtml(otp, displayName);
  const text = `Your POPPIN verification code is: ${otp}. It expires in 10 minutes. If you did not request this code, please ignore this email.`;

  return sendEmail({
    to: cleanTo,
    subject: `Your POPPIN Verification Code: ${otp}`,
    html,
    text,
  });
}

/**
 * Send a 6-digit password reset OTP email via Brevo SMTP.
 */
export async function sendPasswordResetOtpEmail({
  to,
  otp,
  displayName,
}: SendVerificationOtpOptions): Promise<{ id: string }> {
  const cleanTo = to.trim().toLowerCase();

  if (isTestEnvironmentForEmail(cleanTo)) {
    return { id: `mock-reset-email-id-${Date.now()}` };
  }

  const formattedOtp = otp.split("").join(" ");
  const greeting = displayName ? `Hi ${displayName},` : "Hello,";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Your POPPIN Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f2f3f5;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0d14; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e1f22; border-radius: 16px; border: 1px solid #35373c; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center; border-bottom: 1px solid #2b2d31;">
              <span style="font-size: 22px; font-weight: 900; color: #ffffff;">POPPIN<span style="color: #5865F2;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center;">Password Reset Request</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b5bac1; text-align: center;">
                ${greeting} we received a request to reset your password. Use the 6-digit code below to set a new password:
              </p>
              <div style="background-color: #111214; border: 1px solid #5865F2; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; display: block;">
                  ${formattedOtp}
                </span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #949ba4; text-align: center;">
                ⏳ This reset code is valid for <strong>15 minutes</strong> and can only be used once.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #80848e; text-align: center;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #17181b; border-top: 1px solid #2b2d31; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6d737e;">
                &copy; ${new Date().getFullYear()} POPPIN Platform. Crafted for builders & creators.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `Your POPPIN password reset code is: ${otp}. It expires in 15 minutes. If you did not request this, please ignore this email.`;

  return sendEmail({
    to: cleanTo,
    subject: `Your POPPIN Password Reset Code: ${otp}`,
    html,
    text,
  });
}
