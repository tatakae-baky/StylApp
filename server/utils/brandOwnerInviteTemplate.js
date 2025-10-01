export default function BrandOwnerInviteTemplate({
  name,
  email,
  tempPassword,
  brandName,
  adminUrl
}) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111">
    <h2 style="margin-bottom: 8px;">Your Brand Partner Account Is Ready</h2>
    <p>Hi ${name || 'there'},</p>
    <p>
      Your request to become a brand partner for <strong>${brandName}</strong> has been approved.
      We've created your account and generated a one-time password so you can log in to the admin panel.
    </p>

    <div style="margin:16px 0; padding:12px 16px; background:#f6f8fa; border:1px solid #e5e7eb; border-radius:8px;">
      <div><strong>Login URL:</strong> <a href="${adminUrl}" target="_blank">${adminUrl}</a></div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Temporary Password:</strong> ${tempPassword}</div>
    </div>

    <p style="margin-top: 12px;">
      For security, please sign in and immediately change your password from your profile settings.
    </p>
    <p>If you did not request this, please contact support.</p>
    <p style="margin-top: 24px; color:#555">— Stylin Admin</p>
  </div>`;
}

