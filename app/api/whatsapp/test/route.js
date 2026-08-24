import {
  sendWhatsAppText,
} from "@/lib/whatsapp";

export async function GET() {
  try {
    const adminNumber =
      process.env.WHATSAPP_ADMIN_NUMBER;

    if (!adminNumber) {
      return Response.json(
        {
          success: false,
          message:
            "WHATSAPP_ADMIN_NUMBER is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const result =
      await sendWhatsAppText({
        to: adminNumber,

        message:
          "Hello! 👋\n\n" +
          "This is a test WhatsApp notification from the Exhibition Booking System.\n\n" +
          "WhatsApp integration is working successfully.",
      });

    return Response.json({
      success: true,
      message:
        "WhatsApp test message sent successfully.",
      result,
    });
  } catch (error) {
    console.error(
      "WhatsApp test error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to send WhatsApp test message.",
      },
      {
        status: 500,
      }
    );
  }
}