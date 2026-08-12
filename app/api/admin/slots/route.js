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

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    await connectDB();

    const query = {};

    if (search.trim()) {
      query.slotNumber = new RegExp(search.trim(), "i");
    }

    if (category !== "all") {
      query.category = category;
    }

    if (status !== "all") {
      query.status = status;
    }

    const slots = await Slot.find(query)
      .sort({ position: 1, slotNumber: 1 })
      .lean();

    const stats = {
      total: await Slot.countDocuments(),
      available: await Slot.countDocuments({
        status: "available",
      }),
      booked: await Slot.countDocuments({
        status: "booked",
      }),
      unavailable: await Slot.countDocuments({
        status: "unavailable",
      }),
    };

    return Response.json({
      success: true,
      slots,
      stats,
    });
  } catch (error) {
    console.error("Get slots error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load slots.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request) {
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
      id,
      category,
      price,
      status,
      notes,
    } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Slot ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedCategories = [
      "Jewellery",
      "Clothing",
      "Food",
      "Decor",
    ];

    const allowedStatuses = [
      "available",
      "booked",
      "unavailable",
    ];

    if (
      category &&
      !allowedCategories.includes(category)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid category.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid slot status.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const slot = await Slot.findById(id);

    if (!slot) {
      return Response.json(
        {
          success: false,
          message: "Slot not found.",
        },
        {
          status: 404,
        }
      );
    }

    // A booked slot cannot be manually changed.
    if (
      slot.status === "booked" &&
      status &&
      status !== "booked"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Booked slots cannot be manually changed.",
        },
        {
          status: 409,
        }
      );
    }

    if (category) {
      slot.category = category;
    }

    if (typeof price === "number") {
      if (price < 0) {
        return Response.json(
          {
            success: false,
            message: "Price cannot be negative.",
          },
          {
            status: 400,
          }
        );
      }

      slot.price = price;
    }

    if (status) {
      slot.status = status;
    }

    if (typeof notes === "string") {
      slot.notes = notes.trim();
    }

    await slot.save();

    return Response.json({
      success: true,
      message: "Slot updated successfully.",
      slot,
    });
  } catch (error) {
    console.error("Update slot error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update slot.",
      },
      {
        status: 500,
      }
    );
  }
}