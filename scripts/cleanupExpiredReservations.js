import mongoose from "mongoose";
import connectDB from "../lib/mongodb.js";
import Slot from "../models/Slot.js";

async function cleanupExpiredReservations() {
  try {
    await connectDB();

    const now = new Date();

    const result = await Slot.updateMany(
      {
        status: "reserved",

        reservationExpiresAt: {
          $ne: null,
          $lt: now,
        },
      },
      {
        $set: {
          status: "available",
          reservationToken: null,
          reservationExpiresAt: null,
          bookingId: null,
        },
      }
    );

    console.log("--------------------------------");
    console.log("Expired reservation cleanup");
    console.log("--------------------------------");
    console.log(`Checked at: ${now.toISOString()}`);
    console.log(
      `Reservations cleared: ${result.modifiedCount}`
    );
    console.log("--------------------------------");
  } catch (error) {
    console.error(
      "Expired reservation cleanup failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

cleanupExpiredReservations();