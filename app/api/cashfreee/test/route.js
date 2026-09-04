const CASHFREE_CLIENT_ID =
  process.env.CASHFREE_CLIENT_ID;

const CASHFREE_CLIENT_SECRET =
  process.env.CASHFREE_CLIENT_SECRET;

const CASHFREE_ENVIRONMENT =
  process.env.CASHFREE_ENVIRONMENT ||
  "sandbox";

const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION ||
  "2025-01-01";

function getCashfreeUrl() {
  if (!CASHFREE_CLIENT_ID) {
    throw new Error(
      "CASHFREE_CLIENT_ID is not configured."
    );
  }

  if (!CASHFREE_CLIENT_SECRET) {
    throw new Error(
      "CASHFREE_CLIENT_SECRET is not configured."
    );
  }

  if (
    CASHFREE_ENVIRONMENT !== "sandbox" &&
    CASHFREE_ENVIRONMENT !== "production"
  ) {
    throw new Error(
      "CASHFREE_ENVIRONMENT must be sandbox or production."
    );
  }

  const baseUrl =
    CASHFREE_ENVIRONMENT === "production"
      ? "https://api.cashfree.com"
      : "https://sandbox.cashfree.com";

  return `${baseUrl}/pg/orders`;
}

export async function GET() {
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const orderId =
      `test_order_${Date.now()}`;

    const returnUrl =
      `${appUrl}/cashfree-test?order_id=${orderId}`;

    const response = await fetch(
      getCashfreeUrl(),
      {
        method: "POST",

        headers: {
          "X-Client-Secret":
            CASHFREE_CLIENT_SECRET,

          "X-Client-Id":
            CASHFREE_CLIENT_ID,

          "x-api-version":
            CASHFREE_API_VERSION,

          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
  order_amount: 1,

  order_currency: "INR",

  customer_details: {
    customer_id:
      "cashfree_test_user",

    customer_name:
      "Cashfree Test",

    customer_email:
      "test@example.com",

    customer_phone:
      "9999999999",
  },

  order_meta: {
    return_url:
      returnUrl,
  },

  order_note:
    "Cashfree sandbox checkout test",
}),
      }
    );

    const data =
      await response.json();

    console.log(
      "Cashfree test order response:",
      data
    );

    if (!response.ok) {
      console.error(
        "Cashfree test API error:",
        data
      );

      return Response.json(
        {
          success: false,

          message:
            data?.message ||
            data?.error?.message ||
            "Cashfree order creation failed.",

          status:
            response.status,

          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json({
      success: true,

      message:
        "Cashfree sandbox order created successfully.",

      environment:
        CASHFREE_ENVIRONMENT,

      order: {
        orderId:
          data.order_id,

        orderStatus:
          data.order_status,

        paymentSessionId:
          data.payment_session_id,

        orderAmount:
          data.order_amount,

        orderCurrency:
          data.order_currency,
      },
    });
  } catch (error) {
    console.error(
      "Cashfree credential test error:",
      error
    );

    return Response.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to connect to Cashfree.",
      },
      {
        status: 500,
      }
    );
  }
}