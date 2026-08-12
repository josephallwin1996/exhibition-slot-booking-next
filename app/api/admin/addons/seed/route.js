import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import AddOn from "@/models/AddOn";
import { verifyAdminToken } from "@/lib/auth";

async function authenticateAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const admin = verifyAdminToken(token);

  if (!admin || admin.role !== "admin") {
    return null;
  }

  return admin;
}

export async function POST() {
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

    await connectDB();

    const addOns = [
      {
        name: "Extra Chair",
        description:
          "Additional chair for your exhibition stall.",
        price: 500,
        category: "Furniture",
        maxQuantity: 10,
        position: 1,
      },

      {
        name: "Extra Table",
        description:
          "Additional table for your exhibition stall.",
        price: 1000,
        category: "Furniture",
        maxQuantity: 5,
        position: 2,
      },

      {
        name: "Branding Banner",
        description:
          "Printed branding banner for your stall.",
        price: 3500,
        category: "Branding",
        maxQuantity: 2,
        position: 3,
      },

      {
        name: "Power Connection",
        description:
          "Additional electrical power connection.",
        price: 2000,
        category: "Electricity",
        maxQuantity: 2,
        position: 4,
      },
    ];

    const results = [];

    for (const addOn of addOns) {
      const existing = await AddOn.findOne({
        name: addOn.name,
      });

      if (existing) {
        results.push({
          name: addOn.name,
          status: "already_exists",
        });

        continue;
      }

      await AddOn.create(addOn);

      results.push({
        name: addOn.name,
        status: "created",
      });
    }

    return Response.json({
      success: true,
      message: "Add-on seed completed.",
      results,
    });
  } catch (error) {
    console.error("Add-on seed error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to seed add-ons.",
      },
      {
        status: 500,
      }
    );
  }
}