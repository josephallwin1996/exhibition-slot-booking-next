const WHATSAPP_API_VERSION =
  process.env.WHATSAPP_API_VERSION;

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

function getWhatsAppUrl() {
  if (!WHATSAPP_API_VERSION) {
    throw new Error(
      "WHATSAPP_API_VERSION is not configured."
    );
  }

  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error(
      "WHATSAPP_ACCESS_TOKEN is not configured."
    );
  }

  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured."
    );
  }

  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

/*
 * =========================================================
 * SEND WHATSAPP TEMPLATE
 * =========================================================
 */

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "en",
  components = [],
}) {
  if (!to) {
    throw new Error(
      "WhatsApp recipient number is required."
    );
  }

  if (!templateName) {
    throw new Error(
      "WhatsApp template name is required."
    );
  }

  const body = {
    messaging_product: "whatsapp",

    to: String(to),

    type: "template",

    template: {
      name: templateName,

      language: {
        code: languageCode,
      },
    },
  };

  /*
   * Components are only added when supplied.
   *
   * This will be useful later for templates
   * containing variables/buttons.
   */
  if (
    Array.isArray(components) &&
    components.length > 0
  ) {
    body.template.components =
      components;
  }

  const response = await fetch(
    getWhatsAppUrl(),
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(body),
    }
  );

  const data =
    await response.json();

  console.log(
    "WhatsApp template response:",
    data
  );

  if (!response.ok) {
    console.error(
      "WhatsApp template API error:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "WhatsApp template message failed."
    );
  }

  return data;
}

/*
 * =========================================================
 * SEND WHATSAPP TEXT
 * =========================================================
 *
 * Keep this function because we may need it later
 * when sending messages inside an allowed WhatsApp
 * conversation window.
 */

export async function sendWhatsAppText({
  to,
  message,
}) {
  if (!to) {
    throw new Error(
      "WhatsApp recipient number is required."
    );
  }

  if (!message) {
    throw new Error(
      "WhatsApp message is required."
    );
  }

  const response = await fetch(
    getWhatsAppUrl(),
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        messaging_product:
          "whatsapp",

        to: String(to),

        type: "text",

        text: {
          preview_url: true,
          body: message,
        },
      }),
    }
  );

  const data =
    await response.json();

  console.log(
    "WhatsApp text response:",
    data
  );

  if (!response.ok) {
    console.error(
      "WhatsApp API error:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "WhatsApp message failed."
    );
  }

  return data;
}