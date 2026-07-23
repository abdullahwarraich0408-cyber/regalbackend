import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transporter — uses SMTP credentials from environment variables
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL on port 465
  auth: {
    user: process.env.SMTP_USER || "contact@regalknotevents.co.uk",
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = `"Regal Knot Events" <${process.env.SMTP_USER || "contact@regalknotevents.co.uk"}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@regalknotevents.co.uk";

// ---------------------------------------------------------------------------
// Verify connection (called at startup)
// ---------------------------------------------------------------------------
export async function verifyEmailConnection() {
  await transporter.verify();
}

// ---------------------------------------------------------------------------
// Booking confirmation — sent to the customer
// ---------------------------------------------------------------------------
export async function sendBookingConfirmationToCustomer(booking) {
  const preferredDate = booking.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBC";

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: booking.email,
    subject: "✨ Your Booking Request — Regal Knot Events",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2c2c2c;">
        <div style="background: linear-gradient(135deg, #8B0000, #C8A96E); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 26px; letter-spacing: 1px;">Regal Knot Events</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Booking Received</p>
        </div>

        <div style="background: #fff; padding: 32px; border: 1px solid #e8e8e8; border-top: none;">
          <p style="font-size: 16px;">Dear <strong>${booking.fullName}</strong>,</p>
          <p style="line-height: 1.7; color: #555;">
            Thank you for choosing Regal Knot Events! We're thrilled to receive your booking request and will be in touch with you shortly to discuss your event in detail.
          </p>

          <div style="background: #fdf8f0; border-left: 4px solid #C8A96E; padding: 20px 24px; margin: 24px 0; border-radius: 0 6px 6px 0;">
            <h2 style="margin: 0 0 16px; font-size: 16px; color: #8B0000; text-transform: uppercase; letter-spacing: 1px;">Booking Summary</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #888; width: 160px;">Event Type</td><td style="color: #2c2c2c; font-weight: 600;">${booking.eventType}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Preferred Date</td><td style="color: #2c2c2c; font-weight: 600;">${preferredDate}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Location</td><td style="color: #2c2c2c; font-weight: 600;">${booking.eventLocation || "TBC"}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Guest Count</td><td style="color: #2c2c2c; font-weight: 600;">${booking.guestCount || "TBC"}</td></tr>
              <tr><td style="padding: 6px 0; color: #888;">Budget Range</td><td style="color: #2c2c2c; font-weight: 600;">${booking.budgetRange || "TBC"}</td></tr>
            </table>
          </div>

          <p style="line-height: 1.7; color: #555;">
            Our team will review your request and contact you via your preferred method within <strong>1–2 business days</strong>.
            If you have any urgent queries, please do not hesitate to reach out to us directly.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="mailto:${ADMIN_EMAIL}" style="background: linear-gradient(135deg, #8B0000, #C8A96E); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 14px; letter-spacing: 1px; font-family: Georgia, serif;">
              Contact Us
            </a>
          </div>

          <p style="color: #888; font-size: 13px; line-height: 1.6;">
            Warm regards,<br/>
            <strong style="color: #8B0000;">The Regal Knot Events Team</strong><br/>
            <a href="mailto:${ADMIN_EMAIL}" style="color: #C8A96E;">${ADMIN_EMAIL}</a>
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
          © ${new Date().getFullYear()} Regal Knot Events. All rights reserved.
        </div>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Booking notification — sent to admin
// ---------------------------------------------------------------------------
export async function sendBookingNotificationToAdmin(booking) {
  const preferredDate = booking.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBC";

  const altDate = booking.alternativeDate
    ? new Date(booking.alternativeDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "None";

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: `🎉 New Booking Request — ${booking.fullName} (${booking.eventType})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #2c2c2c;">
        <div style="background: #8B0000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">New Booking Request</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Regal Knot Events — Admin Notification</p>
        </div>

        <div style="background: #fff; padding: 28px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #8B0000; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Customer Details</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888; width: 180px;">Full Name</td><td style="font-weight: 600;">${booking.fullName}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Email</td><td><a href="mailto:${booking.email}" style="color: #8B0000;">${booking.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Phone</td><td>${booking.phone || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Preferred Contact</td><td>${booking.preferredContactMethod || "—"}</td></tr>
          </table>

          <h2 style="color: #8B0000; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Event Details</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888; width: 180px;">Event Type</td><td style="font-weight: 600;">${booking.eventType}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Preferred Date</td><td>${preferredDate}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Alternative Date</td><td>${altDate}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Location</td><td>${booking.eventLocation || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Area</td><td>${booking.area || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Guest Count</td><td>${booking.guestCount || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Venue Type</td><td>${booking.venueType || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Setup Time</td><td>${booking.setupTime || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Theme</td><td>${booking.theme || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Services Needed</td><td>${Array.isArray(booking.servicesNeeded) ? booking.servicesNeeded.join(", ") : booking.servicesNeeded || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Budget Range</td><td>${booking.budgetRange || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Inspiration Notes</td><td>${booking.inspirationNotes || "—"}</td></tr>
          </table>

          ${booking.message ? `<div style="background: #fdf8f0; border-left: 3px solid #C8A96E; padding: 16px; margin-top: 16px; font-size: 14px;"><strong>Customer Message:</strong><br/>${booking.message}</div>` : ""}
        </div>

        <div style="background: #f5f5f5; padding: 14px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
          This is an automated notification from Regal Knot Events backend.
        </div>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Enquiry notification — sent to admin
// ---------------------------------------------------------------------------
export async function sendEnquiryNotificationToAdmin(enquiry) {
  const eventDate = enquiry.eventDate
    ? new Date(enquiry.eventDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBC";

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: `📋 New Enquiry — ${enquiry.fullName} (${enquiry.eventType})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #2c2c2c;">
        <div style="background: #8B0000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">New Enquiry Received</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Regal Knot Events — Admin Notification</p>
        </div>

        <div style="background: #fff; padding: 28px; border: 1px solid #ddd; border-top: none;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888; width: 160px;">Full Name</td><td style="font-weight: 600;">${enquiry.fullName}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Phone</td><td>${enquiry.phone || "—"}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Event Type</td><td style="font-weight: 600;">${enquiry.eventType}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #888;">Event Date</td><td>${eventDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Source</td><td>${enquiry.source || "website"}</td></tr>
          </table>
        </div>

        <div style="background: #f5f5f5; padding: 14px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
          This is an automated notification from Regal Knot Events backend.
        </div>
      </div>
    `,
  });
}
