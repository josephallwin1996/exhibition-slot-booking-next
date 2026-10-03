import mongoose from "mongoose";
import Slot from "../models/Slot.js";
import Booking from "../models/Booking.js";
import Application from "../models/Application.js";

const MONGODB_URI = process.env.MONGODB_URI;

const CATEGORY_IDS = {
  jewellery: new mongoose.Types.ObjectId(
    "6a7d4e37e7b2feca11636773"
  ),

  clothing: new mongoose.Types.ObjectId(
    "6a7d4e37e7b2feca11636774"
  ),

  food: new mongoose.Types.ObjectId(
    "6a7d4e37e7b2feca11636775"
  ),

  decor: new mongoose.Types.ObjectId(
    "6a7d4e37e7b2feca11636776"
  ),

  sharedStall: new mongoose.Types.ObjectId(
    "6a8c10a3eda19af3221dac8f"
  ),

  skincare: new mongoose.Types.ObjectId(
    "6aa42dc272bd4e822a593d89"
  ),
};

const SLOT_PRICE = 18000;

/*
|--------------------------------------------------------------------------
| FINAL CLIENT CATEGORY MAPPING
|--------------------------------------------------------------------------
*/

const slotCategories = {
  // Skincare
  "1": "skincare",

  // Clothing
  "2": "clothing",
  "5": "clothing",
  "7": "clothing",
  "8": "clothing",
  "9": "clothing",
  "10": "clothing",
  "11": "clothing",
  "13": "clothing",
  "14": "clothing",
  "16": "clothing",
  "18": "clothing",
  "20": "clothing",
  "23": "clothing",
  "24": "clothing",
  "26": "clothing",
  "28": "clothing",
  "30": "clothing",
  "32": "clothing",
  "38": "clothing",
  "40": "clothing",
  "41": "clothing",
  "54": "clothing",
  "62": "clothing",
  "63": "clothing",
  "64": "clothing",

  // Jewellery
  "3": "jewellery",
  "4": "jewellery",
  "6": "jewellery",
  "17": "jewellery",
  "19": "jewellery",
  "25": "jewellery",
  "39": "jewellery",
  "59": "jewellery",

  // Decor
  "21": "decor",
  "27": "decor",
  "31": "decor",
  "37": "decor",
  "50": "decor",
  "58": "decor",
  "60": "decor",

  // Food
  "22": "food",
  "61": "food",

  // Shared Stall
  "15": "sharedStall",
};

/*
|--------------------------------------------------------------------------
| SLOT 12
|--------------------------------------------------------------------------
| Crossed out / unavailable in client's final list.
*/

const unavailableSlots = ["12"];

/*
|--------------------------------------------------------------------------
| MIGRATION
|--------------------------------------------------------------------------
*/

async function migrateFinalSlotData() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined.");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("");
    console.log("==============================================");
    console.log("FINAL EXHIBITION DATA MIGRATION");
    console.log("==============================================");
    console.log("Connected to MongoDB.");
    console.log("");

    /*
    |--------------------------------------------------------------------------
    | 1. Check existing slots
    |--------------------------------------------------------------------------
    */

    const slotCount = await Slot.countDocuments();

    console.log(`Existing slots found: ${slotCount}`);

    if (slotCount === 0) {
      throw new Error(
        "No slots found. Migration stopped. Run the original slot seed first."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Count test data before deleting
    |--------------------------------------------------------------------------
    */

    const bookingCount = await Booking.countDocuments();
    const applicationCount =
      await Application.countDocuments();

    console.log("");
    console.log("Test data to be cleared:");
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Applications: ${applicationCount}`);
    console.log("");

    /*
    |--------------------------------------------------------------------------
    | 3. Delete test bookings
    |--------------------------------------------------------------------------
    */

    const bookingDeleteResult =
      await Booking.deleteMany({});

    console.log(
      `Deleted bookings: ${bookingDeleteResult.deletedCount}`
    );

    /*
    |--------------------------------------------------------------------------
    | 4. Delete test applications
    |--------------------------------------------------------------------------
    */

    const applicationDeleteResult =
      await Application.deleteMany({});

    console.log(
      `Deleted applications: ${applicationDeleteResult.deletedCount}`
    );

    /*
    |--------------------------------------------------------------------------
    | 5. Reset ALL slot booking/reservation information
    |--------------------------------------------------------------------------
    |
    | This is important because deleting Booking documents alone does not
    | automatically remove bookingId/reservation information stored on Slot.
    |
    */

    const slotResetResult = await Slot.updateMany(
      {},
      {
        $set: {
          category: null,
          price: SLOT_PRICE,

          status: "available",

          bookingId: null,

          reservationToken: null,

          reservationExpiresAt: null,
        },
      }
    );

    console.log(
      `Reset slots: ${slotResetResult.modifiedCount}`
    );

    /*
    |--------------------------------------------------------------------------
    | 6. Apply final category mapping
    |--------------------------------------------------------------------------
    */

    let categorizedCount = 0;

    for (const [
      slotNumber,
      categoryKey,
    ] of Object.entries(slotCategories)) {
      const categoryId = CATEGORY_IDS[categoryKey];

      if (!categoryId) {
        throw new Error(
          `Invalid category key "${categoryKey}" for slot ${slotNumber}`
        );
      }

      const result = await Slot.updateOne(
        {
          slotNumber,
        },
        {
          $set: {
            category: categoryId,
            price: SLOT_PRICE,
            status: "available",
            bookingId: null,
            reservationToken: null,
            reservationExpiresAt: null,
          },
        }
      );

      if (result.matchedCount === 0) {
        console.warn(
          `WARNING: Slot ${slotNumber} was not found.`
        );
      } else {
        categorizedCount++;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Mark unavailable slots
    |--------------------------------------------------------------------------
    */

    for (const slotNumber of unavailableSlots) {
      const result = await Slot.updateOne(
        {
          slotNumber,
        },
        {
          $set: {
            category: null,
            price: SLOT_PRICE,
            status: "unavailable",

            bookingId: null,
            reservationToken: null,
            reservationExpiresAt: null,
          },
        }
      );

      if (result.matchedCount === 0) {
        console.warn(
          `WARNING: Unavailable slot ${slotNumber} was not found.`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Final verification
    |--------------------------------------------------------------------------
    */

    const finalAvailableCount =
      await Slot.countDocuments({
        status: "available",
      });

    const finalUnavailableCount =
      await Slot.countDocuments({
        status: "unavailable",
      });

    const slotsWithBookingId =
      await Slot.countDocuments({
        bookingId: {
          $ne: null,
        },
      });

    const slotsWithReservationToken =
      await Slot.countDocuments({
        reservationToken: {
          $ne: null,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | 9. Print summary
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("==============================================");
    console.log("FINAL MIGRATION COMPLETE");
    console.log("==============================================");

    console.log("");
    console.log("TEST DATA CLEARED");
    console.log("----------------------------------------------");
    console.log(
      `Bookings deleted: ${bookingDeleteResult.deletedCount}`
    );
    console.log(
      `Applications deleted: ${applicationDeleteResult.deletedCount}`
    );

    console.log("");
    console.log("SLOT DATA");
    console.log("----------------------------------------------");
    console.log(`Total slots: ${slotCount}`);
    console.log(`Categorized slots: ${categorizedCount}`);
    console.log(
      `Price: ₹${SLOT_PRICE.toLocaleString("en-IN")}`
    );
    console.log(
      `Available slots: ${finalAvailableCount}`
    );
    console.log(
      `Unavailable slots: ${finalUnavailableCount}`
    );

    console.log("");
    console.log("BOOKING / RESERVATION RESET");
    console.log("----------------------------------------------");
    console.log(
      `Slots with bookingId: ${slotsWithBookingId}`
    );
    console.log(
      `Slots with reservationToken: ${slotsWithReservationToken}`
    );

    console.log("");
    console.log("UNAVAILABLE SLOTS");
    console.log("----------------------------------------------");
    console.log(unavailableSlots.join(", "));

    console.log("");
    console.log(
      "Blank client stalls remain unassigned."
    );

    console.log("");
    console.log("==============================================");
    console.log("Migration finished successfully.");
    console.log("==============================================");
    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "=============================================="
    );
    console.error("FINAL MIGRATION FAILED");
    console.error("==============================================");
    console.error(error);
    console.error("");

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateFinalSlotData();