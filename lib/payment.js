export function getPaymentConfig() {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay payment configuration is missing."
    );
  }

  return {
    keyId,
    keySecret,
  };
}