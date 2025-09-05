import mongoose from "mongoose";
import { connectDB } from "./mongodb.js";
import "dotenv/config";


import User from "../models/User.js";
import Pharmacy from "../models/Pharmacy.js";
import Coupon from "../models/Coupon.js";
import Disposal from "../models/Disposal.js";

const seed = async () => {
  await connectDB();

  // Clear old data (careful in production!)
  await User.deleteMany({});
  await Pharmacy.deleteMany({});
  await Coupon.deleteMany({});
  await Disposal.deleteMany({});

  console.log("🗑️ Old data cleared");

  // Create Users
  const users = await User.insertMany([
    { name: "Priya Sharma", email: "priya@example.com", password: "hashed_pw_123" },
    { name: "Amit Gupta", email: "amit@example.com", password: "hashed_pw_456" }
  ]);

  // Create Pharmacies
  const pharmacies = await Pharmacy.insertMany([
    {
      name: "Gupta Medicos",
      address: "Connaught Place, Delhi",
      city: "Delhi",
      state: "Delhi",
      partnerCode: "PHARMA001",
      location: { type: "Point", coordinates: [77.2195, 28.6329] } // lng, lat
    },
    {
      name: "HealthPlus Pharmacy",
      address: "Bandra, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      partnerCode: "PHARMA002",
      location: { type: "Point", coordinates: [72.8355, 19.0596] }
    }
  ]);

  // Create Coupons
  const coupons = await Coupon.insertMany([
    { title: "₹100 Off on 1mg", description: "Valid on orders above ₹500", pointsRequired: 50, sponsor: "1mg", expiryDate: new Date("2025-12-31") },
    { title: "20% Off Blood Test", description: "Dr. Lal PathLabs", pointsRequired: 75, sponsor: "Dr. Lal PathLabs", expiryDate: new Date("2025-10-31") }
  ]);

  // Create a Disposal linked to Priya + Gupta Medicos
  await Disposal.create({
    user: users[0]._id,
    pharmacy: pharmacies[0]._id,
    items: [
      { medicineName: "Crocin Advance", qty: 1, unit: "strip", sealed: true, expiryDate: new Date("2024-07-01"), aiConfidence: 0.92 },
      { medicineName: "Cough Syrup", qty: 1, unit: "bottle", sealed: false, expiryDate: new Date("2023-12-01"), aiConfidence: 0.85 }
    ],
    disposalCode: "A4T92C",
    status: "Pending"
  });

  console.log("✅ Seed data inserted");
  mongoose.connection.close();
};

seed();
