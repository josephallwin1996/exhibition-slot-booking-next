export async function GET() {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  return Response.json({
    success: true,

    razorpay: {
      configured: Boolean(
        keyId && keySecret
      ),

      keyIdPresent: Boolean(keyId),

      keySecretPresent: Boolean(
        keySecret
      ),

      keyIdPrefix: keyId
        ? keyId.substring(0, 8)
        : null,
    },
  });
}