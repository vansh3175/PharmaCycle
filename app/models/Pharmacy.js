import mongoose from "mongoose";

const PharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
  },
  partnerCode: { type: String, required: true, unique: true },
  disposalsVerified: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Pharmacy || mongoose.model("Pharmacy", PharmacySchema);
