/**
 * FAYZEE Email Service Abstraction
 * 
 * Supports:
 * - Resend API via native fetch (requires RESEND_API_KEY)
 * - Safe development fallback (logs reset link to console in dev/test)
 * - Configurable sender address via EMAIL_FROM
 */

interface SendPasswordResetEmailParams {
  to: string;
  userName?: string;
  resetToken: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  devUrl?: string;
  error?: string;
}

export async function sendPasswordResetEmail({
  to,
  userName = "Valued Customer",
  resetToken,
}: SendPasswordResetEmailParams): Promise<EmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const isDev = process.env.NODE_ENV !== "production";
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "FAYZEE <onboarding@resend.dev>";

  // Development / Test Fallback: Safe console logging so developers can test without credentials
  if (!resendApiKey) {
    if (isDev) {
      console.log("\n==================================================");
      console.log("📨 [FAYZEE DEV EMAIL SERVICE] Password Reset Dispatched");
      console.log(`Recipient: ${to} (${userName})`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log("Expiry: 30 minutes");
      console.log("==================================================\n");
      return { success: true, devUrl: resetUrl };
    } else {
      console.warn("⚠️ [FAYZEE EMAIL] No RESEND_API_KEY configured in production. Password reset email could not be dispatched.");
      return { success: false, error: "Email provider not configured." };
    }
  }

  // Production dispatch via Resend REST API
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "Reset Your FAYZEE Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">FAYZEE</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Premium Multi-Vendor Marketplace</p>
            </div>
            
            <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Password Reset Request</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password for your FAYZEE account. Click the button below to choose a new password:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 12px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              This link will expire in <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              &copy; ${new Date().getFullYear()} FAYZEE. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return { success: false, error: "Failed to dispatch email via Resend." };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error("Failed to send reset email:", err);
    return { success: false, error: err.message };
  }
}
