import nodemailer from 'nodemailer';

let cachedTransporter = null;
let isEthereal = false;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // 1. Direct Gmail Configuration (if provided in .env)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    isEthereal = false;
    console.log(`📧 Configured Gmail transporter for: ${process.env.GMAIL_USER}`);
    return cachedTransporter;
  }

  // 2. Custom SMTP Host (if provided in .env)
  if (process.env.SMTP_HOST) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
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

const sendWithFallback = async (primaryTransporter, mailOptions) => {
  try {
    const info = await primaryTransporter.sendMail(mailOptions);
    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 [Preview Email in Browser]: ${previewUrl}`);
    }
    return info;
  } catch (err) {
    const isAuthError = err.code === 'EAUTH' || 
                        err.responseCode === 535 || 
                        (err.message && (err.message.includes('535') || err.message.includes('BadCredentials')));

    if (isAuthError) {
      console.warn('⚠️ Gmail rejected credentials (Google requires a 16-character App Password).');
      console.warn('   Generate one at: https://myaccount.google.com/apppasswords');
      console.log('📬 Delivering to instant web-preview mailer so order is preserved...');

      try {
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
        const info = await fallbackTransporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`🔗 [Instant Web Preview URL]: ${previewUrl}`);
        return info;
      } catch (fallbackErr) {
        console.error('Fallback mailer error:', fallbackErr.message);
      }
    }
    throw err;
  }
};

export const sendConfirmationEmail = async ({
  bookingId = '',
  customerEmail,
  workerName,
  workerEmail,
  service,
  location,
  date
}) => {
  const transporter = await getTransporter();
  const clientAppUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'support@quickfix.com';
  const refCode = bookingId ? `QF-${String(bookingId).slice(-6).toUpperCase()}` : `QF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (!transporter) {
    console.log('📧 Mailer unavailable. Skipping notification.');
    console.log(`   Customer: ${customerEmail}, Worker: ${workerEmail}`);
    return;
  }

  try {
    // ----------------------------------------------------
    // 1. OFFICIAL CONFIRMATION EMAIL TO CUSTOMER
    // ----------------------------------------------------
    if (customerEmail) {
      const customerMailOptions = {
        from: `"QuickFix Home Services" <${fromEmail}>`,
        to: customerEmail,
        subject: `✅ Booking Confirmed (#${refCode}): ${service} with ${workerName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Service Booking Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                    
                    <!-- BRAND HEADER -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 32px 28px; text-align: left;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td>
                              <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 900; font-size: 14px; padding: 6px 12px; border-radius: 8px; letter-spacing: 0.5px;">
                                QUICKFIX™
                              </div>
                              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 14px 0 4px 0; letter-spacing: -0.5px;">
                                Partner Assigned & Confirmed
                              </h1>
                              <p style="color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;">
                                Reference ID: <strong style="color: #cbd5e1; font-family: monospace;">#${refCode}</strong>
                              </p>
                            </td>
                            <td align="right" valign="top">
                              <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                                Active Order
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- HERO BODY -->
                    <tr>
                      <td style="padding: 32px;">
                        <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 20px 0;">
                          Hello,
                        </p>
                        <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 24px 0;">
                          Great news! Your service booking for <strong style="color: #0f172a;">${service}</strong> has been accepted. A background-verified professional has been dispatched to handle your request.
                        </p>

                        <!-- PARTNER PROFILE CARD -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="48" valign="middle">
                                <div style="width: 44px; height: 44px; border-radius: 50%; background: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 18px; line-height: 44px; text-align: center;">
                                  ${workerName ? workerName.charAt(0).toUpperCase() : 'P'}
                                </div>
                              </td>
                              <td style="padding-left: 14px;" valign="middle">
                                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">
                                  ${workerName}
                                </h3>
                                <p style="margin: 2px 0 0 0; font-size: 12px; color: #059669; font-weight: 700;">
                                  ★ 4.9 Verified Professional • Urban Shield Certified
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- BOOKING DETAILS TABLE -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Service Requested</td>
                            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${service}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time Slot</td>
                            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${date}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Service Location</td>
                            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700;">${location}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600;">Booking Status</td>
                            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                              <span style="background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 99px; text-transform: uppercase;">
                                In Progress
                              </span>
                            </td>
                          </tr>
                        </table>

                        <!-- ASSURANCE PILLARS -->
                        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 28px;">
                          <p style="margin: 0; color: #065f46; font-size: 12px; line-height: 18px; font-weight: 600;">
                            🛡️ <strong>The QuickFix Promise:</strong> Backed by 30-day rework warranty. Transparent rate card with zero surprise charges. Pay securely only after your inspection.
                          </p>
                        </div>

                        <!-- CTA BUTTON -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center">
                              <a href="${clientAppUrl}/dashboard" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
                                View Order & Track Pro →
                              </a>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 11px; margin: 0 0 6px 0; font-weight: 500;">
                          Questions or need to reschedule? Contact 24/7 Support at support@quickfix.com
                        </p>
                        <p style="color: #cbd5e1; font-size: 10px; margin: 0;">
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
        `,
      };

      await sendWithFallback(transporter, customerMailOptions);
      console.log(`📧 Customer confirmation email sent to: ${customerEmail}`);
    }

    // ----------------------------------------------------
    // 2. OFFICIAL ASSIGNMENT CONFIRMATION TO WORKER
    // ----------------------------------------------------
    if (workerEmail) {
      const workerMailOptions = {
        from: `"QuickFix Partner Dispatch" <${fromEmail}>`,
        to: workerEmail,
        subject: `⚡ Job Claimed (#${refCode}): ${service} at ${location}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Job Assignment Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 30px 10px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 30px; text-align: left;">
                        <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">
                          🔧 Job Assignment Confirmed
                        </h1>
                        <p style="color: #a7f3d0; font-size: 12px; margin: 6px 0 0 0;">
                          Order #${refCode} has been assigned to your partner profile
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 28px;">
                        <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">
                          Hi <strong>${workerName}</strong>, you have confirmed this job. Please arrive 10 minutes before the scheduled time with proper equipment and uniform.
                        </p>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
                          <p style="margin: 4px 0;"><strong>Service:</strong> ${service}</p>
                          <p style="margin: 4px 0;"><strong>Address:</strong> ${location}</p>
                          <p style="margin: 4px 0;"><strong>Scheduled Slot:</strong> ${date}</p>
                          <p style="margin: 4px 0;"><strong>Customer Contact:</strong> ${customerEmail}</p>
                        </div>
                        <div style="text-align: center;">
                          <a href="${clientAppUrl}/dashboard" target="_blank" style="display: inline-block; background-color: #065f46; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
                            Open Partner Console
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      await sendWithFallback(transporter, workerMailOptions);
      console.log(`📧 Worker dispatch email sent to: ${workerEmail}`);
    }
  } catch (error) {
    console.error('📧 Email delivery error:', error.message);
  }
};
