import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface AppointmentEmailData {
  userName: string;
  userEmail: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string;
}

export async function sendConfirmationEmail(data: AppointmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,119,255,0.08);">
        <div style="background:linear-gradient(135deg,#0A77FF 0%,#0056CC 100%);padding:40px 32px;text-align:center;">
          <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="font-size:32px;">✅</span>
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Appointment Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Your booking has been successfully scheduled</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${data.userName}</strong>,</p>
          <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Your appointment has been confirmed. Here are your booking details:</p>

          <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin-bottom:24px;">
            <div style="display:flex;align-items:center;margin-bottom:16px;">
              <div style="width:40px;height:40px;background:#0A77FF;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:12px;">
                <span style="color:#fff;font-size:18px;">📋</span>
              </div>
              <div>
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Service</p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${data.serviceName}</p>
              </div>
            </div>
            <div style="border-top:1px solid #dbeafe;padding-top:16px;display:grid;gap:12px;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#6b7280;font-size:14px;">📅 Date</span>
                <span style="color:#111827;font-weight:600;font-size:14px;">${data.date}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#6b7280;font-size:14px;">🕐 Time</span>
                <span style="color:#111827;font-weight:600;font-size:14px;">${data.startTime} – ${data.endTime}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#6b7280;font-size:14px;">🔖 Booking ID</span>
                <span style="color:#0A77FF;font-weight:600;font-size:13px;font-family:monospace;">#${data.appointmentId.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;color:#92400e;">
              <strong>⏰ Reminder:</strong> We'll send you an automated reminder 24 hours before your appointment. Please arrive 5 minutes early.
            </p>
          </div>

          <div style="text-align:center;margin-bottom:24px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display:inline-block;background:#0A77FF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              View My Appointments
            </a>
          </div>
        </div>
        <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:13px;color:#9ca3af;">© 2024 AppointEase. If you need to cancel, please do so at least 2 hours before your appointment.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AppointEase <noreply@appointease.com>",
      to: data.userEmail,
      subject: `✅ Appointment Confirmed – ${data.serviceName} on ${data.date}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}

export async function sendReminderEmail(data: AppointmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,119,255,0.08);">
        <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">⏰ Appointment Reminder</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">Your appointment is tomorrow!</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${data.userName}</strong>,</p>
          <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>:</p>

          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${data.serviceName}</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:14px;">📅 ${data.date} &nbsp;|&nbsp; 🕐 ${data.startTime} – ${data.endTime}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">Booking ID: #${data.appointmentId.slice(-8).toUpperCase()}</p>
          </div>

          <div style="text-align:center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Manage Appointment
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AppointEase <noreply@appointease.com>",
      to: data.userEmail,
      subject: `⏰ Reminder: ${data.serviceName} tomorrow at ${data.startTime}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send reminder email:", err);
  }
}

export async function sendCancellationEmail(data: AppointmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Appointment Cancelled</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:16px;">Hi <strong>${data.userName}</strong>,</p>
          <p style="color:#6b7280;font-size:15px;">Your appointment for <strong>${data.serviceName}</strong> on <strong>${data.date}</strong> at <strong>${data.startTime}</strong> has been cancelled.</p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.NEXTAUTH_URL}/book" style="display:inline-block;background:#0A77FF;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Book a New Appointment
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.userEmail,
      subject: `Appointment Cancelled – ${data.serviceName}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
  }
}
