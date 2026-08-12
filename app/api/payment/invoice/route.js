import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Application from "@/models/Application";
import {
  generateInvoiceNumber,
} from "@/lib/invoice";
import {
  generateInvoicePdf,
} from "@/lib/generateInvoicePdf";

export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    const bookingReference =
      body?.bookingReference;

    if (!bookingReference) {
      return Response.json(
        {
          success: false,
          message:
            "Booking reference is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const booking =
      await Booking.findOne({
        bookingReference,
      });

    if (!booking) {
      return Response.json(
        {
          success: false,
          message:
            "Booking not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Only paid bookings can have
     * invoices.
     */
    if (
      booking.status !== "paid" ||
      booking.paymentStatus !== "paid"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invoice is available only after successful payment.",
        },
        {
          status: 409,
        }
      );
    }

    const application =
      await Application.findById(
        booking.applicationId
      ).lean();

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Exhibitor application not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * If invoice already exists,
     * return it instead of generating
     * another invoice number.
     */
    if (!booking.invoiceNumber) {
      /*
       * Temporary sequence based on
       * current timestamp.
       *
       * We'll replace this with a
       * proper counter collection below.
       */
      const sequence =
        Date.now() % 100000;

      booking.invoiceNumber =
        generateInvoiceNumber(
          sequence
        );

      booking.invoiceIssuedAt =
        new Date();

      await booking.save();
    }

    const pdfBuffer =
      await generateInvoicePdf({
        booking,
        application,
      });

    return new Response(
      pdfBuffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="${booking.invoiceNumber}.pdf"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Invoice generation error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to generate invoice.",
      },
      {
        status: 500,
      }
    );
  }
}