import PDFDocument from "pdfkit";

export function generateInvoicePdf({
  booking,
  application,
}) {
  return new Promise(
    (resolve, reject) => {
      try {
        const doc =
          new PDFDocument({
            size: "A4",
            margin: 50,
          });

        const chunks = [];

        doc.on(
          "data",
          (chunk) => {
            chunks.push(chunk);
          }
        );

        doc.on(
          "end",
          () => {
            const pdfBuffer =
              Buffer.concat(chunks);

            resolve(pdfBuffer);
          }
        );

        doc.on(
          "error",
          reject
        );

        /*
         * Header
         */
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(
            "EXHIBITION",
            {
              align: "left",
            }
          );

        doc
          .moveDown(0.3)
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text(
            "STALL BOOKING INVOICE"
          );

        doc
          .fillColor("#000000")
          .moveDown(1);

        /*
         * Invoice information
         */
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(
            `Invoice Number: ${booking.invoiceNumber}`
          );

        doc
          .font("Helvetica")
          .text(
            `Invoice Date: ${formatDate(
              booking.invoiceIssuedAt ||
                new Date()
            )}`
          );

        doc.text(
          `Booking Reference: ${booking.bookingReference}`
        );

        doc.moveDown(1.5);

        /*
         * Exhibitor details
         */
        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(
            "Bill To"
          );

        doc
          .moveDown(0.4)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(
            application.businessName ||
              "—"
          );

        doc
          .font("Helvetica")
          .text(
            application.contactPerson ||
              "—"
          );

        doc.text(
          application.email || "—"
        );

        doc.text(
          application.mobileNumber ||
            "—"
        );

        doc.moveDown(1.5);

        /*
         * Table header
         */
        drawTableHeader(doc);

        let y = doc.y;

        /*
         * Stall row
         */
        drawTableRow(
          doc,
          y,
          `Stall ${booking.slotNumber}`,
          "1",
          booking.slotPrice
        );

        y += 28;

        /*
         * Add-ons
         */
        for (const addOn of
          booking.addOns || []) {
          drawTableRow(
            doc,
            y,
            `${addOn.name}`,
            String(
              addOn.quantity
            ),
            addOn.total
          );

          y += 28;
        }

        /*
         * Summary
         */
        y += 15;

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            "Subtotal",
            380,
            y
          );

        doc
          .font("Helvetica-Bold")
          .text(
            formatCurrency(
              booking.subtotal
            ),
            470,
            y,
            {
              width: 75,
              align: "right",
            }
          );

        y += 25;

        doc
          .font("Helvetica")
          .text(
            "Total",
            380,
            y
          );

        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(
            formatCurrency(
              booking.total
            ),
            450,
            y - 2,
            {
              width: 95,
              align: "right",
            }
          );

        y += 45;

        /*
         * Payment information
         */
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(
            "Payment Details",
            50,
            y
          );

        y += 20;

        doc
          .fontSize(9)
          .font("Helvetica")
          .text(
            `Payment Status: ${booking.paymentStatus}`,
            50,
            y
          );

        y += 15;

        doc.text(
          `Payment ID: ${
            booking.razorpayPaymentId ||
            "—"
          }`,
          50,
          y
        );

        y += 15;

        doc.text(
          `Payment Date: ${
            booking.paidAt
              ? formatDate(
                  booking.paidAt
                )
              : "—"
          }`,
          50,
          y
        );

        /*
         * Footer
         */
        doc
          .fontSize(9)
          .fillColor("#666666")
          .text(
            "Thank you for participating in our exhibition.",
            50,
            750,
            {
              align: "center",
              width: 495,
            }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    }
  );
}

function drawTableHeader(doc) {
  const y = doc.y;

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .rect(50, y, 495, 25)
    .fill("#111827");

  doc
    .fillColor("#ffffff")
    .text(
      "Description",
      60,
      y + 8
    );

  doc.text(
    "Qty",
    390,
    y + 8
  );

  doc.text(
    "Amount",
    460,
    y + 8
  );

  doc.moveDown(2);
}

function drawTableRow(
  doc,
  y,
  description,
  quantity,
  amount
) {
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000000")
    .text(
      description,
      60,
      y + 8,
      {
        width: 300,
      }
    );

  doc.text(
    quantity,
    390,
    y + 8
  );

  doc.text(
    formatCurrency(amount),
    450,
    y + 8,
    {
      width: 95,
      align: "right",
    }
  );

  doc
    .strokeColor("#dddddd")
    .moveTo(50, y + 27)
    .lineTo(545, y + 27)
    .stroke();
}

function formatCurrency(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  return new Date(
    value
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}