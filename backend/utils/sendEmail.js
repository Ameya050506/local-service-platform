import nodemailer from 'nodemailer';

let cachedTransporter = null;
let isEthereal = false;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // 1. Direct Gmail Configuration (strips whitespace automatically)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const cleanUser = process.env.GMAIL_USER.trim();
    const cleanPass = process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '');
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });
    isEthereal = false;
    console.log(`📧 Configured Gmail transporter for: ${cleanUser}`);
    return cachedTransporter;
  }

  // 2. Custom SMTP Host (if provided in .env)
  if (process.env.SMTP_HOST) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      connectionTimeout: 6000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    isEthereal = false;
    return cachedTransporter;
  }

  // 3. Automatic Ethereal fallback (creates real instant web-viewable test inboxes)
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    console.log('📬 Initialized automatic test mailer (instant web preview URLs enabled).');
    return cachedTransporter;
  } catch (err) {
    console.warn('⚠️ Could not initialize mailer:', err.message);
    return null;
  }
};

/**
 * Universal email dispatcher:
 * - Uses Resend HTTPS API (Port 443) if RESEND_API_KEY is present (100% bypasses Render Free Tier SMTP block)
 * - Otherwise uses Nodemailer with graceful fallback
 */
const deliverEmail = async ({ to, subject, html, fromEmail = 'support@quickfix.com' }) => {
  // Option A: Resend API over HTTPS (Port 443 - Never blocked by Render Free Tier)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'QuickFix <onboarding@resend.dev>',
          to: [to],
          subject,
          html
        })
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`🚀 [Resend HTTPS API] Email successfully delivered to: ${to} (ID: ${resData.id})`);
        return resData;
      } else {
        console.warn('⚠️ Resend API responded with error:', resData);
      }
    } catch (apiErr) {
      console.error('Resend API dispatch error:', apiErr.message);
    }
  }

  // Option B: Nodemailer SMTP
  const transporter = await getTransporter();
  if (!transporter) return;

  const mailOptions = {
    from: `"QuickFix Home Services" <${fromEmail}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [Nodemailer] Email sent to: ${to}`);
    if (isEthereal) {
      console.log(`🔗 [Preview in Browser]: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.warn(`⚠️ Nodemailer failed (${err.code || err.message}).`);
    if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET' || err.message?.includes('timeout')) {
      console.error('🚨 NOTE: Render Free Tier blocks outbound SMTP ports 25, 465, and 587.');
      console.error('   To send emails from Render, add RESEND_API_KEY in Render Environment to use HTTPS Port 443.');
    }

    // Try Ethereal fallback for testing preview
    try {
      const testAccount = await nodemailer.createTestAccount();
      const fallbackTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`🔗 [Instant Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
      return info;
    } catch (fallbackErr) {
      console.error('Fallback mailer error:', fallbackErr.message);
    }
  }
};

// ========================================================
// 1. INSTANT EMAIL UPON BOOKING CREATION
// ========================================================
export const sendBookingCreatedEmail = async ({
  bookingId = '',
  customerEmail,
  service,
  location,
  date,
  desc = ''
}) => {
  if (!customerEmail) return;

  const clientAppUrl = process.env.CLIENT_URL || 'https://local-service-platform-steel.vercel.app';
  const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'support@quickfix.com';
  const refCode = bookingId ? `QF-${String(bookingId).slice(-6).toUpperCase()}` : `QF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  await deliverEmail({
    to: customerEmail,
    fromEmail,
    subject: `📋 Booking Received (#${refCode}): ${service}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Placed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #312e81 100%); padding: 32px; text-align: left;">
                    <div style="display: inline-block; background: #6366f1; color: #ffffff; font-weight: 900; font-size: 13px; padding: 5px 12px; border-radius: 6px;">
                      QUICKFIX™
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 14px 0 4px 0;">
                      We have received your booking!
                    </h1>
                    <p style="color: #c7d2fe; font-size: 13px; margin: 0;">
                      Reference ID: <strong style="color: #ffffff; font-family: monospace;">#${refCode}</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px;">
                    <p style="color: #334155; font-size: 15px; margin: 0 0 20px 0;">
                      Hi there,
                    </p>
                    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0;">
                      Your booking for <strong style="color: #0f172a;">${service}</strong> has been successfully registered. We are broadcasting your request to verified service partners in your neighborhood.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Service</td>
                        <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700;">${service}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time Slot</td>
                        <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Location</td>
                        <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 700;">${location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Current Status</td>
                        <td align="right" style="padding: 12px 16px;">
                          <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 99px;">
                            Pending Partner Claim
                          </span>
                        </td>
                      </tr>
                    </table>

                    <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #3730a3; font-size: 12px; font-weight: 600;">
                        ⏱️ You will receive a follow-up email the moment a certified professional claims your order.
                      </p>
                    </div>

                    <div style="text-align: center;">
                      <a href="${clientAppUrl}/dashboard" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                        View My Dashboard →
                      </a>
                    </div>

                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                      © 2026 QuickFix Services Technologies Inc. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};

// ========================================================
// 2. CONFIRMATION EMAIL UPON PARTNER ACCEPTANCE
// ========================================================
export const sendConfirmationEmail = async ({
  bookingId = '',
  customerEmail,
  workerName,
  workerEmail,
  service,
  location,
  date
}) => {
  const clientAppUrl = process.env.CLIENT_URL || 'https://local-service-platform-steel.vercel.app';
  const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'support@quickfix.com';
  const refCode = bookingId ? `QF-${String(bookingId).slice(-6).toUpperCase()}` : `QF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Customer Email
  if (customerEmail) {
    await deliverEmail({
      to: customerEmail,
      fromEmail,
      subject: `⚡ Partner Assigned (#${refCode}): ${service} with ${workerName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Partner Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 10px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
                  
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px; text-align: left;">
                      <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 900; font-size: 13px; padding: 5px 12px; border-radius: 6px;">
                        QUICKFIX™
                      </div>
                      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 14px 0 4px 0;">
                        Partner Assigned & En Route
                      </h1>
                      <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                        Reference ID: <strong style="color: #cbd5e1; font-family: monospace;">#${refCode}</strong>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 32px;">
                      <p style="color: #334155; font-size: 15px; margin: 0 0 20px 0;">
                        Great news! <strong>${workerName}</strong> has accepted your booking for <strong>${service}</strong>.
                      </p>

                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                        <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">
                          ${workerName}
                        </h3>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #059669; font-weight: 700;">
                          ★ 4.9 Verified Professional • Urban Shield Certified
                        </p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Service</td>
                          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${service}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time Slot</td>
                          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${date}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Location</td>
                          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${location}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Status</td>
                          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                            <span style="background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 99px;">
                              In Progress
                            </span>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                        <p style="margin: 0; color: #065f46; font-size: 12px; font-weight: 600;">
                          🛡️ Backed by 30-day rework warranty. Pay safely only after your job is completed.
                        </p>
                      </div>

                      <div style="text-align: center;">
                        <a href="${clientAppUrl}/dashboard" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                          Track Professional Live →
                        </a>
                      </div>

                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
                      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                        © 2026 QuickFix Services Technologies Inc. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
  }

  // Worker Email
  if (workerEmail) {
    await deliverEmail({
      to: workerEmail,
      fromEmail,
      subject: `⚡ Job Claimed (#${refCode}): ${service} at ${location}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2>Job Assignment Confirmed (#${refCode})</h2>
          <p>You have claimed the job for <strong>${service}</strong>.</p>
          <p><strong>Scheduled:</strong> ${date}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><a href="${clientAppUrl}/dashboard">Open Partner Console</a></p>
        </body>
        </html>
      `
    });
  }
};
