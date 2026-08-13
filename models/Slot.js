import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "booked",
        "unavailable",
      ],
      default: "available",
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    position: {
      type: Number,
      default: 0,
    },

    row: {
      type: Number,
      default: 0,
    },

    column: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
    },

    reservationToken: {
      type: String,
      default: null,
    },

    reservationExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

slotSchema.index({
  category: 1,
  status: 1,
});

const Slot =
  mongoose.models.Slot ||
  mongoose.model("Slot", slotSchema);

export default Slot;