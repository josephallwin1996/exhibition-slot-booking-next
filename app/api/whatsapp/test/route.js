import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export async function GET() {
  try {
    const result =
      await sendWhatsAppTemplate({
        to: "919645395716",
        templateName: "hello_world",
        languageCode: "en",
      });

    return Response.json({
      success: true,
      message:
        "WhatsApp test template sent successfully.",
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
          error?.message ||
          "WhatsApp test failed.",
      },
      {
        status: 500,
      }
    );
  }
}