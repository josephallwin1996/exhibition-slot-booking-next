import mongoose from "mongoose";

const bookingAddOnSchema = new mongoose.Schema(
  {
    addOnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOn",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    slotNumber: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    slotPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    addOns: {
      type: [bookingAddOnSchema],
      default: [],
    },

    addOnTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "reserved",
        "pending_payment",
        "paid",
        "cancelled",
        "expired",
      ],
      default: "reserved",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    reservationExpiresAt: {
      type: Date,
      default: null,
    },

    paymentId: {
        type: String,
        default: null,
      },

    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    invoiceNumber: {
      type: String,
      default: null,
    },

    invoiceIssuedAt: {
      type: Date,
      default: null,
    },

    invoicePdfUrl: {
      type: String,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  applicationId: 1,
});

bookingSchema.index({
  slotId: 1,
});

bookingSchema.index({
  status: 1,
});

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;