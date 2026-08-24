import { sendWhatsAppText } from "@/lib/whatsapp";

function normalizePhoneNumber(phone) {
  if (!phone) {
    return "";
  }

  return String(phone).replace(/[^\d]/g, "");
}

function getAdminNumber() {
  return normalizePhoneNumber(
    process.env.WHATSAPP_ADMIN_NUMBER
  );
}

/**
 * Admin:
 * New application notification
 */
export async function sendNewApplicationAdminWhatsApp({
  businessName,
  contactPerson,
  email,
  mobile,
  category,
  approvalLink,
}) {
  const adminNumber = getAdminNumber();

  if (!adminNumber) {
    throw new Error(
      "WHATSAPP_ADMIN_NUMBER is not configured."
    );
  }

  const message = [
    "🔔 *New Exhibition Application*",
    "",
    `Business: ${businessName}`,
    `Contact: ${contactPerson}`,
    `Category: ${category}`,
    `Email: ${email}`,
    `Mobile: ${mobile}`,
    "",
    "Please review the application.",
    "",
    `Approve application:\n${approvalLink}`,
  ].join("\n");

  return sendWhatsAppText({
    to: adminNumber,
    message,
  });
}

/**
 * Applicant:
 * Application submitted
 */
export async function sendApplicationSubmittedWhatsApp({
  name,
  businessName,
  category,
  mobile,
}) {
  const recipient = normalizePhoneNumber(mobile);

  if (!recipient) {
    throw new Error(
      "Applicant WhatsApp number is missing."
    );
  }

  const message = [
    `Hello ${name}, 👋`,
    "",
    "We have received your exhibition application.",
    "",
    `Business: ${businessName}`,
    `Category: ${category}`,
    "",
    "Your application is currently under review.",
    "",
    "We will notify you once your application has been reviewed.",
  ].join("\n");

  return sendWhatsAppText({
    to: recipient,
    message,
  });
}

/**
 * Applicant:
 * Application approved
 */
export async function sendApplicationApprovedWhatsApp({
  name,
  businessName,
  category,
  mobile,
  bookingLink,
}) {
  const recipient = normalizePhoneNumber(mobile);

  if (!recipient) {
    throw new Error(
      "Applicant WhatsApp number is missing."
    );
  }

  const message = [
    `Hello ${name}, 🎉`,
    "",
    "Your exhibition application has been approved.",
    "",
    `Business: ${businessName}`,
    `Category: ${category}`,
    "",
    "You can now select your exhibition stall using the link below:",
    "",
    bookingLink,
    "",
    "Please complete your stall selection and payment within the reservation period.",
  ].join("\n");

  return sendWhatsAppText({
    to: recipient,
    message,
  });
}