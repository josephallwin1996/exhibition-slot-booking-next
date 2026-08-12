import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function sendApplicationSubmittedEmail({
  name,
  email,
  businessName,
  category,
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Application Received – Exhibition",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
        <div style="background: #020617; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Exhibition
          </h1>
        </div>

        <div style="padding: 32px;">
          <h2>Application Received</h2>

          <p>Hello ${escapeHtml(name)},</p>

          <p>
            Thank you for applying to participate in our exhibition.
            We have successfully received your application.
          </p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 24px 0;">
            <p style="margin: 5px 0;">
              <strong>Business:</strong> ${escapeHtml(businessName)}
            </p>

            <p style="margin: 5px 0;">
              <strong>Category:</strong> ${escapeHtml(category)}
            </p>

            <p style="margin: 5px 0;">
              <strong>Status:</strong> Pending Review
            </p>
          </div>

          <p>
            Our team will review your application and notify you
            once a decision has been made.
          </p>

          <p>
            Thank you,<br />
            Exhibition Team
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendNewApplicationAdminEmail({
  businessName,
  contactPerson,
  email,
  category,
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Exhibition Application – ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
        <div style="background: #020617; padding: 32px;">
          <h1 style="color: white; margin: 0;">
            New Application
          </h1>
        </div>

        <div style="padding: 32px;">
          <p>
            A new exhibitor application has been submitted.
          </p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
            <p><strong>Business:</strong> ${escapeHtml(businessName)}</p>
            <p><strong>Contact:</strong> ${escapeHtml(contactPerson)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Category:</strong> ${escapeHtml(category)}</p>
          </div>

          <p style="margin-top: 24px;">
            <a
              href="${APP_URL}/admin/dashboard"
              style="display: inline-block; background: #020617; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px;"
            >
              Open Admin Dashboard
            </a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendApplicationApprovedEmail({
  name,
  email,
  businessName,
  bookingToken,
}) {
  const bookingUrl = `${APP_URL}/book/${bookingToken}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Application Approved – Book Your Exhibition Stall",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
        <div style="background: #020617; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Application Approved
          </h1>
        </div>

        <div style="padding: 32px;">
          <p>Hello ${escapeHtml(name)},</p>

          <p>
            We are pleased to inform you that your application
            for <strong>${escapeHtml(businessName)}</strong>
            has been approved.
          </p>

          <p>
            You can now select your exhibition stall and continue
            with the booking process.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a
              href="${bookingUrl}"
              style="display: inline-block; background: #020617; color: white; padding: 15px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;"
            >
              Select Your Stall
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Please keep this email private. Your booking link is
            unique to your application.
          </p>

          <p>
            Thank you,<br />
            Exhibition Team
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendApplicationRejectedEmail({
  name,
  email,
  businessName,
  rejectionReason,
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Application Update – Exhibition",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
        <div style="background: #020617; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Application Update
          </h1>
        </div>

        <div style="padding: 32px;">
          <p>Hello ${escapeHtml(name)},</p>

          <p>
            Thank you for your interest in participating in our
            exhibition.
          </p>

          <p>
            After reviewing your application for
            <strong>${escapeHtml(businessName)}</strong>,
            we are unable to approve the application at this time.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 10px; margin: 24px 0;">
            <p style="margin: 0;">
              <strong>Reason:</strong>
            </p>

            <p style="margin-bottom: 0;">
              ${escapeHtml(rejectionReason)}
            </p>
          </div>

          <p>
            We appreciate your interest and hope to have the
            opportunity to work with you in the future.
          </p>

          <p>
            Thank you,<br />
            Exhibition Team
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendBookingCompletedEmail({
  name,
  email,
  businessName,
  bookingReference,
  slotNumber,
  category,
  total,
  addOns = [],
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Booking Confirmed – ${bookingReference}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">

        <div style="background: #020617; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Booking Confirmed
          </h1>
        </div>

        <div style="padding: 32px;">

          <p>
            Hello ${escapeHtml(name)},
          </p>

          <p>
            Your exhibition stall booking has been successfully
            confirmed.
          </p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 24px 0;">

            <p style="margin: 6px 0;">
              <strong>Business:</strong>
              ${escapeHtml(businessName)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Booking Reference:</strong>
              ${escapeHtml(bookingReference)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Category:</strong>
              ${escapeHtml(category)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Stall:</strong>
              ${escapeHtml(slotNumber)}
            </p>

          </div>

          ${
            addOns.length > 0
              ? `
                <h3 style="margin-top: 28px;">
                  Add-ons
                </h3>

                <div style="background: #f8fafc; padding: 16px; border-radius: 10px;">

                  ${addOns
                    .map(
                      (addOn) => `
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                          <span>
                            ${escapeHtml(addOn.name)}
                            × ${Number(addOn.quantity || 1)}
                          </span>

                          <strong>
                            ₹${Number(
                              addOn.total || 0
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      `
                    )
                    .join("")}

                </div>
              `
              : ""
          }

          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 20px;">

            <p style="font-size: 18px; margin: 0;">
              <strong>Total:</strong>
              ₹${Number(total || 0).toLocaleString("en-IN")}
            </p>

          </div>

          <p style="margin-top: 28px;">
            Thank you for participating in our exhibition.
          </p>

          <p>
            Thank you,<br />
            Exhibition Team
          </p>

        </div>
      </div>
    `,
  });
}

export async function sendPaymentSuccessEmail({
  name,
  email,
  businessName,
  bookingReference,
  slotNumber,
  total,
  paymentId,
  paidAt,
  invoiceNumber,
  invoicePdf,
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,

    subject: `Payment Successful – ${bookingReference}`,

    attachments: invoicePdf
      ? [
          {
            filename: `${invoiceNumber || bookingReference}-invoice.pdf`,
            content: invoicePdf,
          },
        ]
      : [],

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">

        <div style="background: #020617; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">
            Payment Successful
          </h1>
        </div>

        <div style="padding: 32px;">

          <div style="text-align: center; margin-bottom: 28px;">

            <div style="
              display: inline-block;
              width: 60px;
              height: 60px;
              line-height: 60px;
              border-radius: 50%;
              background: #dcfce7;
              color: #16a34a;
              font-size: 30px;
              font-weight: bold;
            ">
              ✓
            </div>

          </div>

          <p>
            Hello ${escapeHtml(name)},
          </p>

          <p>
            Your payment has been successfully received and
            your exhibition stall booking is now confirmed.
          </p>

          <div style="
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin: 24px 0;
          ">

            <p style="margin: 6px 0;">
              <strong>Business:</strong>
              ${escapeHtml(businessName)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Booking Reference:</strong>
              ${escapeHtml(bookingReference)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Stall:</strong>
              ${escapeHtml(slotNumber)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Payment ID:</strong>
              ${escapeHtml(paymentId)}
            </p>

            <p style="margin: 6px 0;">
              <strong>Payment Date:</strong>
              ${escapeHtml(
                formatEmailDate(paidAt)
              )}
            </p>

            ${
              invoiceNumber
                ? `
                  <p style="margin: 6px 0;">
                    <strong>Invoice Number:</strong>
                    ${escapeHtml(invoiceNumber)}
                  </p>
                `
                : ""
            }

          </div>

          <div style="
            background: #020617;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          ">

            <p style="
              margin: 0;
              color: #94a3b8;
              font-size: 13px;
            ">
              Amount Paid
            </p>

            <p style="
              margin: 6px 0 0;
              font-size: 28px;
              font-weight: bold;
            ">
              ₹${Number(total || 0).toLocaleString("en-IN")}
            </p>

          </div>

          <p style="
            margin-top: 28px;
            color: #475569;
          ">
            Your invoice is attached to this email.
            Please keep it for your records.
          </p>

          <p>
            Thank you,<br />
            Exhibition Team
          </p>

        </div>
      </div>
    `,
  });
}

export async function sendBookingPaymentAdminEmail({
  businessName,
  contactPerson,
  email,
  bookingReference,
  slotNumber,
  category,
  total,
  paymentId,
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,

    subject: `Payment Received – ${bookingReference}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">

        <div style="background: #020617; padding: 32px;">
          <h1 style="color: white; margin: 0;">
            Payment Received
          </h1>
        </div>

        <div style="padding: 32px;">

          <p>
            A booking payment has been successfully received.
          </p>

          <div style="
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
          ">

            <p>
              <strong>Business:</strong>
              ${escapeHtml(businessName)}
            </p>

            <p>
              <strong>Contact:</strong>
              ${escapeHtml(contactPerson)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Category:</strong>
              ${escapeHtml(category)}
            </p>

            <p>
              <strong>Stall:</strong>
              ${escapeHtml(slotNumber)}
            </p>

            <p>
              <strong>Booking Reference:</strong>
              ${escapeHtml(bookingReference)}
            </p>

            <p>
              <strong>Payment ID:</strong>
              ${escapeHtml(paymentId)}
            </p>

            <p style="font-size: 18px;">
              <strong>Amount:</strong>
              ₹${Number(total || 0).toLocaleString("en-IN")}
            </p>

          </div>

          <p style="margin-top: 24px;">
            <a
              href="${APP_URL}/admin/dashboard"
              style="
                display: inline-block;
                background: #020617;
                color: white;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
              "
            >
              Open Admin Dashboard
            </a>
          </p>

        </div>
      </div>
    `,
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatEmailDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}