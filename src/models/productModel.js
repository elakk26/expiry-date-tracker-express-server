const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    upcCode: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    category: {
      type: String,
      trim: true,
    },
    notifiedAt: {
      sevenDays: { type: Date, default: null },
      threeDays: { type: Date, default: null },
      oneDay: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Powers dashboard query
productSchema.index({ userId: 1, expiryDate: 1 });
// Powers search
productSchema.index({ title: "text", upcCode: "text" });
// Powers barcode duplicate check (could be unique if we want one entry per barcode per user)
productSchema.index({ userId: 1, upcCode: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
