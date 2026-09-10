/**
 * FAYZEE Email Service Abstraction
 * 
 * Production-ready email dispatcher supporting:
 * - Resend REST API (https://resend.com) via native fetch
 * - Dynamic domain resolution (defaults to https://fayzee.store in production)
 * - Safe error logging and diagnostics
 * - HTML and Plaintext multipart templates
 */

interface SendPasswordResetEmailParams {
  to: string;
  userName?: string;
  resetToken: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  devUrl?: string;
  error?: string;
  isSimulated?: boolean;
}

/**
 * Resolves the authoritative public domain for password reset links.
 * Always resolves to https://fayzee.store in production / on Vercel unless explicitly overridden.
 */
export function getAppBaseUrl(): string {
  // 1. Explicit user override
  if (process.env.APP_URL && process.env.APP_URL.trim()) {
    return process.env.APP_URL.trim().replace(/\/$/, "");
  }

  // 2. Explicit public app URL if not pointing to localhost
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
  ) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }

  // 3. Vercel deployment environment or production mode
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://fayzee.store";
  }

  // 4. Localhost development fallback
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Dispatches a password reset email using the configured email provider (Resend API).
 */
export async function sendPasswordResetEmail({
  to,
  userName = "Valued Customer",
  resetToken,
}: SendPasswordResetEmailParams): Promise<EmailResult> {
  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const isDev = process.env.NODE_ENV !== "production";
  const resendApiKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");
  
  // Default sender: once domain fayzee.store is verified on Resend, uses support@fayzee.store or no-reply@fayzee.store.
  // Resend fallback testing address: onboarding@resend.dev
  const fromEmail = process.env.EMAIL_FROM?.trim().replace(/^["']|["']$/g, "") || "FAYZEE <onboarding@resend.dev>";

  // Diagnostics check: Missing API Key (Never pretend success when key is absent)
  if (!resendApiKey) {
    const errorMsg = "RESEND_API_KEY is not configured in environment variables.";
    console.error(
      "❌ [FAYZEE EMAIL ERROR] Email dispatch blocked: RESEND_API_KEY is missing in environment variables."
    );
    if (isDev) {
      console.warn("⚠️ [FAYZEE DEV NOTICE] Local testing reset URL:", resetUrl);
    }
    return {
      success: false,
      error: errorMsg,
      devUrl: isDev ? resetUrl : undefined,
    };
  }

  // Real dispatch via Resend REST API (POST https://api.resend.com/emails)
  try {
    console.log(`📨 [FAYZEE EMAIL] Sending password reset email to ${to} via Resend (from: ${fromEmail})...`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "Reset Your FAYZEE Password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your FAYZEE Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F9FA;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F9FA; padding: 32px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #DDE2E6; box-shadow: 0 4px 6px -1px rgba(28, 42, 57, 0.06);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #0B0F14; padding: 32px 24px; text-align: center; border-bottom: 2px solid #C8A96B;">
                        <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">FAYZEE</h1>
                        <p style="color: #C8A96B; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 6px 0 0 0;">Shop More • Live Better</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 36px 32px;">
                        <h2 style="color: #0B0F14; font-size: 20px; font-weight: 800; margin: 0 0 16px 0;">Password Reset Request</h2>
                        <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                          Hello <strong>${userName}</strong>,
                        </p>
                        <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                          We received a request to reset your password for your FAYZEE account. Click the button below to choose a new, secure password:
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                          <tr>
                            <td align="center">
                              <a href="${resetUrl}" target="_blank" style="background-color: #0B0F14; color: #C8A96B; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; display: inline-block; border: 1px solid #C8A96B; box-shadow: 0 4px 12px rgba(11, 15, 20, 0.25);">
                                Reset My Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Expiration & Security Note -->
                        <div style="background-color: #FAF9F6; border-radius: 12px; padding: 14px 16px; margin: 24px 0 16px 0; border: 1px solid #E8E5DC; border-left: 4px solid #C8A96B;">
                          <p style="color: #333333; font-size: 12px; line-height: 1.5; margin: 0;">
                            ⏳ <strong>Security Notice:</strong> This link will expire in <strong>30 minutes</strong> and can only be used once. If you did not request a password reset, you can safely ignore this email — your account and password remain completely secure.
                          </p>
                        </div>

                        <!-- Direct Link Fallback -->
                        <p style="color: #8A8F98; font-size: 12px; line-height: 1.5; margin: 20px 0 8px 0;">
                          Button not working? Copy and paste this URL into your browser:
                        </p>
                        <p style="color: #0B0F14; font-size: 11px; word-break: break-all; margin: 0; background-color: #FAF9F6; padding: 8px 12px; border-radius: 8px; border: 1px solid #E8E5DC;">
                          <a href="${resetUrl}" style="color: #A07C38; text-decoration: underline;">${resetUrl}</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0B0F14; padding: 24px 32px; text-align: center;">
                        <p style="color: #8A8F98; font-size: 11px; margin: 0 0 6px 0;">
                          &copy; ${new Date().getFullYear()} FAYZEE Marketplace. All rights reserved.
                        </p>
                        <p style="color: #8A8F98; font-size: 11px; margin: 0;">
                          Pakistan's Premier Multi-Vendor E-Commerce Platform • <a href="https://fayzee.store" style="color: #C8A96B; text-decoration: underline;">fayzee.store</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `FAYZEE - Password Reset Request\n\nHello ${userName},\n\nWe received a request to reset your password for your FAYZEE account. To set a new password, open this link in your browser:\n\n${resetUrl}\n\nThis link expires in 30 minutes and can only be used once.\nIf you did not request this, please ignore this email — your account remains safe.\n\n- The FAYZEE Team\nhttps://fayzee.store`,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detailedError =
        errData.message ||
        errData.error ||
        response.statusText ||
        "Resend API rejected the email dispatch request.";
      console.error("❌ [RESEND API ERROR]:", {
        status: response.status,
        statusText: response.statusText,
        error: errData,
        recipient: to,
        sender: fromEmail,
      });
      return { success: false, error: detailedError };
    }

    const data = await response.json();
    console.log(`✅ [FAYZEE EMAIL SUCCESS] Dispatched to ${to}, Resend ID: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error("❌ [EMAIL DISPATCH EXCEPTION]:", err);
    return {
      success: false,
      error: err.message || "Network exception occurred while connecting to email provider.",
    };
  }
}
