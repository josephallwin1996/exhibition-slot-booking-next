import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: [
        "Furniture",
        "Branding",
        "Electricity",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },

    maxQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

addOnSchema.index({
  status: 1,
  position: 1,
});

const AddOn =
  mongoose.models.AddOn ||
  mongoose.model("AddOn", addOnSchema);

export default AddOn;