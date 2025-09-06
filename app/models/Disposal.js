import mongoose from "mongoose";

const DisposalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // The 'pharmacy' field is now optional. It will be added later during the
  // verification step, so `required: true` has been removed.
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
  items: [{
    medicineName: { type: String, required: true }, // AI recognized name
    category: { type: String }, // optional category field
    qty: { type: Number, default: 1 },
    unit: { type: String, enum: ["strip", "bottle", "tablet", "syrup", "other"], default: "other" },
    sealed: { type: Boolean, default: false },
    expiryDate: Date,
    aiConfidence: Number // optional: confidence score from AI model
  }],
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  disposalCode: { type: String, required: true, unique: true }, // e.g., A4T92C
  userLocation: {
    pincode: String,
    city: String,
    state: String,
    country: String,
    fullAddress: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  completedAt: Date, // When the disposal was completed at pharmacy
  points: { type: Number, default: 0 } // Points earned from this disposal
}, { timestamps: true });

export default mongoose.models.Disposal || mongoose.model("Disposal", DisposalSchema);
