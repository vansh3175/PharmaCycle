import mongoose from "mongoose";

const PharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  phone: String,
  rating: { type: Number, default: 4.5 },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  partnerCode: { type: String, unique: true, sparse: true },
  disposalsVerified: { type: Number, default: 0 },
  openUntil: String,
  verified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Pharmacy || mongoose.model("Pharmacy", PharmacySchema);
