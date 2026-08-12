export function generateInvoiceNumber(
  sequence
) {
  const year =
    new Date().getFullYear();

  return `INV-${year}-${String(
    sequence
  ).padStart(5, "0")}`;
}