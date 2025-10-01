const VerificationEmail = (username, otp, purpose = "account-verify") => {
    // Styl branded verification email – mobile-friendly and accessible
    // Inline CSS kept minimal for email client compatibility
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email • Styl</title>
      <style>
          body { margin:0; padding:0; background:#f7f7f8; color:#111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
          .container { max-width:600px; margin:24px auto; background:#ffffff; border:1px solid #e5e7eb; }
          .header { text-align:center; padding:28px 24px 0 24px; }
          .brand { display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:18px; color:#111827; text-decoration:none; }
          .kicker { color:#6b7280; font-size:12px; letter-spacing:.08em; text-transform:uppercase; margin:16px 0 4px; }
          h1 { margin:0; font-size:22px; line-height:28px; }
          .content { padding:20px 24px 28px 24px; text-align:center; }
          .otp { display:inline-block; font-size:24px; letter-spacing:6px; font-weight:700; color:#FF2E4D; background:#fff1f2; border:1px dashed #fecdd3; padding:12px 16px; border-radius:0px; margin:16px 0; }
          .hint { color:#6b7280; font-size:14px; margin-top:8px; }
          .footer { text-align:center; color:#6b7280; font-size:12px; padding:16px 16px 24px; }
          .divider { height:1px; background:#f3f4f6; margin:0 24px; }
          a { color:#FF2E4D; text-decoration:none; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              ${purpose === 'forgot-password' ? `
                <p class="kicker">Password Reset</p>
                <h1>Hi ${username}, verify to reset your password</h1>
              ` : `
                <p class="kicker">Email Verification</p>
                <h1>Hi ${username}, confirm your email address</h1>
              `}
          </div>
          <div class="content">
              ${purpose === 'forgot-password' ? `
                <p>Use the code below to verify and continue resetting your password.</p>
              ` : `
                <p>Use the verification code below to finish setting up your Styl account.</p>
              `}
              <div class="otp" aria-label="Your one-time verification code">${otp}</div>
              <p class="hint">This code expires in 10 minutes and can be used once.</p>
              <p class="hint">Didn’t request this? You can safely ignore this email.</p>
          </div>
          <div class="divider"></div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Styl. You know it, You see it, You styl it.</p>
              <p>Need help? Email <a href="mailto:sales@styl.bd.com">sales@styl.bd.com</a> or call +880 1857340719</p>
          </div>
      </div>
  </body>
  </html>`;
  };


  export default VerificationEmail;