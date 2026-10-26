import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Use configured SMTP or fallback to Ethereal (test)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Gmail shortcut
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return null;
};

export const sendConfirmationEmail = async ({ customerEmail, workerName, workerEmail, service, location, date }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email not configured. Skipping email notifications.');
    console.log(`   Would have emailed Customer: ${customerEmail}, Worker: ${workerEmail}`);
    return;
  }

  const fromEmail = process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@quickfix.com';

  try {
    // Email to Customer
    await transporter.sendMail({
      from: `"QuickFix Platform" <${fromEmail}>`,
      to: customerEmail,
      subject: `✅ Your ${service} request has been accepted!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔧 QuickFix</h1>
            <p style="color: #dbeafe; margin: 8px 0 0; font-size: 14px;">Service Confirmation</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Great news! Your request has been accepted.</h2>
            <p style="color: #64748b;">A verified professional has confirmed your service request.</p>
            <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Service</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${service}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Professional</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${workerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Location</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${location}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Date</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${date}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Status</td><td style="padding: 8px 0;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-weight: 600; font-size: 13px;">In Progress</span></td></tr>
            </table>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 QuickFix Services. All rights reserved.</p>
        </div>
      `,
    });
    console.log(`📧 Confirmation email sent to customer: ${customerEmail}`);

    // Email to Worker
    await transporter.sendMail({
      from: `"QuickFix Platform" <${fromEmail}>`,
      to: workerEmail,
      subject: `🎉 You've been confirmed for: ${service}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔧 QuickFix</h1>
            <p style="color: #d1fae5; margin: 8px 0 0; font-size: 14px;">Job Assignment Confirmed</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Your role has been confirmed!</h2>
            <p style="color: #64748b;">You have been assigned to the following service request. Please arrive on time.</p>
            <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Service</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${service}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Location</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${location}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Date</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${date}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Status</td><td style="padding: 8px 0;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 99px; font-weight: 600; font-size: 13px;">Confirmed</span></td></tr>
            </table>
            <p style="color: #64748b; font-size: 14px;">Log in to your dashboard for full details.</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 QuickFix Services. All rights reserved.</p>
        </div>
      `,
    });
    console.log(`📧 Confirmation email sent to worker: ${workerEmail}`);
  } catch (error) {
    console.error('📧 Email sending failed:', error.message);
  }
};
