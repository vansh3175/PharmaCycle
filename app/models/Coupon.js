import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "₹100 Off on 1mg"
  description: String,
  pointsRequired: { type: Number, required: true },
  sponsor: String, // brand/company sponsoring
  expiryDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
