import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    categoryName: {
      type: String,
      default: null,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    /*
     * Slots that the admin has approved for this applicant.
     *
     * The applicant will later be able to choose
     * one slot from this list.
     */
    allowedSlotIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
      },
    ],

    description: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    socialMedia: {
      type: String,
      trim: true,
      default: "",
    },

    logoUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    bookingToken: {
      type: String,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({
  categoryId: 1,
  status: 1,
});

const Application =
  mongoose.models.Application ||
  mongoose.model(
    "Application",
    applicationSchema
  );

export default Application;