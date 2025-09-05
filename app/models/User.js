import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // store hashed password
  points: { type: Number, default: 0 },
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
