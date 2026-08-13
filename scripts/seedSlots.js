import mongoose from "mongoose";
import Slot from "../models/Slot.js";

const SLOT_PRICE = 25000;

/*
 * Physical exhibition layout.
 *
 * Category is intentionally null.
 * Admin will assign categories later.
 *
 * row / column are used by ExhibitionLayout.
 */

const slots = [
  // -------------------------------------------------------
  // TOP ROW
  // -------------------------------------------------------

  {
    slotNumber: "45",
    row: 1,
    column: 1,
    position: 1,
  },
  {
    slotNumber: "46",
    row: 1,
    column: 2,
    position: 2,
  },
  {
    slotNumber: "47",
    row: 1,
    column: 3,
    position: 3,
  },
  {
    slotNumber: "48",
    row: 1,
    column: 4,
    position: 4,
  },
  {
    slotNumber: "49",
    row: 1,
    column: 5,
    position: 5,
  },
  {
    slotNumber: "50",
    row: 1,
    column: 6,
    position: 6,
  },
  {
    slotNumber: "51",
    row: 1,
    column: 7,
    position: 7,
  },
  {
    slotNumber: "52",
    row: 1,
    column: 8,
    position: 8,
  },
  {
    slotNumber: "53",
    row: 1,
    column: 9,
    position: 9,
  },
  {
    slotNumber: "54",
    row: 1,
    column: 10,
    position: 10,
  },
  {
    slotNumber: "55",
    row: 1,
    column: 11,
    position: 11,
  },
  {
    slotNumber: "56",
    row: 1,
    column: 12,
    position: 12,
  },

  // -------------------------------------------------------
  // SECOND ROW
  // -------------------------------------------------------

  {
    slotNumber: "33",
    row: 2,
    column: 1,
    position: 13,
  },
  {
    slotNumber: "34",
    row: 2,
    column: 2,
    position: 14,
  },
  {
    slotNumber: "35",
    row: 2,
    column: 3,
    position: 15,
  },
  {
    slotNumber: "36",
    row: 2,
    column: 4,
    position: 16,
  },
  {
    slotNumber: "37",
    row: 2,
    column: 5,
    position: 17,
  },
  {
    slotNumber: "38",
    row: 2,
    column: 6,
    position: 18,
  },
  {
    slotNumber: "39",
    row: 2,
    column: 7,
    position: 19,
  },
  {
    slotNumber: "40",
    row: 2,
    column: 8,
    position: 20,
  },
  {
    slotNumber: "41",
    row: 2,
    column: 9,
    position: 21,
  },
  {
    slotNumber: "42",
    row: 2,
    column: 10,
    position: 22,
  },
  {
    slotNumber: "43",
    row: 2,
    column: 11,
    position: 23,
  },
  {
    slotNumber: "44",
    row: 2,
    column: 12,
    position: 24,
  },

  // -------------------------------------------------------
  // CENTRAL UPPER ROW
  // -------------------------------------------------------

  {
    slotNumber: "23",
    row: 3,
    column: 2,
    position: 25,
  },
  {
    slotNumber: "24",
    row: 3,
    column: 3,
    position: 26,
  },
  {
    slotNumber: "25",
    row: 3,
    column: 4,
    position: 27,
  },
  {
    slotNumber: "26",
    row: 3,
    column: 5,
    position: 28,
  },
  {
    slotNumber: "27",
    row: 3,
    column: 6,
    position: 29,
  },
  {
    slotNumber: "28",
    row: 3,
    column: 7,
    position: 30,
  },
  {
    slotNumber: "29",
    row: 3,
    column: 8,
    position: 31,
  },
  {
    slotNumber: "30",
    row: 3,
    column: 9,
    position: 32,
  },
  {
    slotNumber: "31",
    row: 3,
    column: 10,
    position: 33,
  },
  {
    slotNumber: "32",
    row: 3,
    column: 11,
    position: 34,
  },

  // -------------------------------------------------------
  // CENTRAL LOWER ROW
  // -------------------------------------------------------

  {
    slotNumber: "12",
    row: 4,
    column: 2,
    position: 35,
  },
  {
    slotNumber: "13",
    row: 4,
    column: 3,
    position: 36,
  },
  {
    slotNumber: "14",
    row: 4,
    column: 4,
    position: 37,
  },
  {
    slotNumber: "15",
    row: 4,
    column: 5,
    position: 38,
  },
  {
    slotNumber: "16",
    row: 4,
    column: 6,
    position: 39,
  },
  {
    slotNumber: "17",
    row: 4,
    column: 7,
    position: 40,
  },
  {
    slotNumber: "18",
    row: 4,
    column: 8,
    position: 41,
  },
  {
    slotNumber: "19",
    row: 4,
    column: 9,
    position: 42,
  },
  {
    slotNumber: "20",
    row: 4,
    column: 10,
    position: 43,
  },
  {
    slotNumber: "21",
    row: 4,
    column: 11,
    position: 44,
  },

  // -------------------------------------------------------
  // BOTTOM LEFT
  // -------------------------------------------------------

  {
    slotNumber: "6",
    row: 5,
    column: 1,
    position: 45,
  },
  {
    slotNumber: "5",
    row: 5,
    column: 2,
    position: 46,
  },
  {
    slotNumber: "4",
    row: 5,
    column: 3,
    position: 47,
  },
  {
    slotNumber: "3",
    row: 5,
    column: 4,
    position: 48,
  },
  {
    slotNumber: "2",
    row: 5,
    column: 5,
    position: 49,
  },
  {
    slotNumber: "1",
    row: 5,
    column: 6,
    position: 50,
  },

  // -------------------------------------------------------
  // BOTTOM RIGHT
  // -------------------------------------------------------

  {
    slotNumber: "7",
    row: 5,
    column: 8,
    position: 51,
  },
  {
    slotNumber: "8",
    row: 5,
    column: 9,
    position: 52,
  },
  {
    slotNumber: "9",
    row: 5,
    column: 10,
    position: 53,
  },
  {
    slotNumber: "10",
    row: 5,
    column: 11,
    position: 54,
  },
  {
    slotNumber: "11",
    row: 5,
    column: 12,
    position: 55,
  },

  // -------------------------------------------------------
  // SIDE STALL
  // -------------------------------------------------------

  {
    slotNumber: "22",
    row: 6,
    column: 12,
    position: 56,
  },

  // -------------------------------------------------------
  // FOOD STALLS - LEFT
  // -------------------------------------------------------

  {
    slotNumber: "57",
    row: 7,
    column: 1,
    position: 57,
  },
  {
    slotNumber: "58",
    row: 7,
    column: 2,
    position: 58,
  },
  {
    slotNumber: "59",
    row: 7,
    column: 3,
    position: 59,
  },
  {
    slotNumber: "60",
    row: 7,
    column: 4,
    position: 60,
  },

  // -------------------------------------------------------
  // FOOD STALLS - RIGHT
  // -------------------------------------------------------

  {
    slotNumber: "61",
    row: 7,
    column: 9,
    position: 61,
  },
  {
    slotNumber: "62",
    row: 7,
    column: 10,
    position: 62,
  },
  {
    slotNumber: "63",
    row: 7,
    column: 11,
    position: 63,
  },
  {
    slotNumber: "64",
    row: 7,
    column: 12,
    position: 64,
  },
];

async function seedSlots() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    /*
     * Safety check.
     *
     * We intentionally do not delete existing
     * slots automatically.
     */
    const existingCount =
      await Slot.countDocuments();

    if (existingCount > 0) {
      throw new Error(
        `Slots collection is not empty. Found ${existingCount} slots. Clear the collection first if you intentionally want to reseed.`
      );
    }

    const documents =
      slots.map((slot) => ({
        ...slot,

        category: null,

        price: SLOT_PRICE,

        status: "available",

        bookingId: null,

        reservationToken: null,

        reservationExpiresAt: null,

        notes: "",
      }));

    await Slot.insertMany(
      documents
    );

    console.log("");
    console.log(
      `Successfully created ${documents.length} slots.`
    );
    console.log(
      `Slot price: ₹${SLOT_PRICE.toLocaleString("en-IN")}`
    );
    console.log("");

    console.log(
      "Slots:"
    );

    documents.forEach((slot) => {
      console.log(
        `${slot.slotNumber} → row ${slot.row}, column ${slot.column}`
      );
    });
  } catch (error) {
    console.error(
      "Slot seed failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedSlots();