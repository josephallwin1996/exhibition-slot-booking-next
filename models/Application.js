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
      required: true,
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

    category: {
      type: String,
      enum: ["Jewellery", "Clothing", "Food", "Decor"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
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
      enum: ["pending", "approved", "rejected"],
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

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export default Application;