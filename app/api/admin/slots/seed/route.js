import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Slot from "@/models/Slot";
import { verifyAdminToken } from "@/lib/auth";

async function authenticateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const admin = verifyAdminToken(token);

  if (!admin || admin.role !== "admin") {
    return null;
  }

  return admin;
}

export async function POST(request) {
  try {
    const admin = await authenticateAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      slots,
      defaultPrice,
    } = body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No slots were provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof defaultPrice !== "number" ||
      defaultPrice < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid default price.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const results = [];

    for (const slot of slots) {
      if (!slot.slotNumber || !slot.category) {
        continue;
      }

      const existingSlot = await Slot.findOne({
        slotNumber: slot.slotNumber,
      });

      if (existingSlot) {
        results.push({
          slotNumber: slot.slotNumber,
          status: "already_exists",
        });

        continue;
      }

      const newSlot = await Slot.create({
        slotNumber: String(slot.slotNumber).trim(),

        category: slot.category,

        price:
          typeof slot.price === "number"
            ? slot.price
            : defaultPrice,

        status: slot.status || "available",

        position:
          typeof slot.position === "number"
            ? slot.position
            : 0,

        row:
          typeof slot.row === "number"
            ? slot.row
            : 0,

        column:
          typeof slot.column === "number"
            ? slot.column
            : 0,

        notes: slot.notes || "",
      });

      results.push({
        slotNumber: newSlot.slotNumber,
        status: "created",
      });
    }

    return Response.json({
      success: true,
      message: "Slot seed process completed.",
      results,
    });
  } catch (error) {
    console.error("Slot seed error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create slots.",
      },
      {
        status: 500,
      }
    );
  }
}