import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import AddOn from "@/models/AddOn";
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
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    await connectDB();

    const query = {};

    if (search.trim()) {
      query.name = new RegExp(search.trim(), "i");
    }

    if (category !== "all") {
      query.category = category;
    }

    if (status !== "all") {
      query.status = status;
    }

    const addOns = await AddOn.find(query)
      .sort({
        position: 1,
        createdAt: 1,
      })
      .lean();

    const stats = {
      total: await AddOn.countDocuments(),
      active: await AddOn.countDocuments({
        status: "active",
      }),
      inactive: await AddOn.countDocuments({
        status: "inactive",
      }),
    };

    return Response.json({
      success: true,
      addOns,
      stats,
    });
  } catch (error) {
    console.error("Get add-ons error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load add-ons.",
      },
      { status: 500 }
    );
  }
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
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      price,
      category,
      maxQuantity,
      status,
    } = body;

    if (!name?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Add-on name is required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericMaxQuantity = Number(maxQuantity);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid price.",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(numericMaxQuantity) ||
      numericMaxQuantity < 1
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Maximum quantity must be at least 1.",
        },
        { status: 400 }
      );
    }

    const allowedCategories = [
      "Furniture",
      "Branding",
      "Electricity",
      "Other",
    ];

    if (
      category &&
      !allowedCategories.includes(category)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid add-on category.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await AddOn.findOne({
      name: name.trim(),
    });

    if (existing) {
      return Response.json(
        {
          success: false,
          message:
            "An add-on with this name already exists.",
        },
        { status: 409 }
      );
    }

    const lastAddOn = await AddOn.findOne()
      .sort({ position: -1 })
      .lean();

    const position =
      typeof lastAddOn?.position === "number"
        ? lastAddOn.position + 1
        : 1;

    const addOn = await AddOn.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: numericPrice,
      category: category || "Other",
      maxQuantity: numericMaxQuantity,
      status:
        status === "inactive"
          ? "inactive"
          : "active",
      position,
    });

    return Response.json(
      {
        success: true,
        message: "Add-on created successfully.",
        addOn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create add-on error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create add-on.",
      },
      { status: 500 }
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
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      name,
      description,
      price,
      category,
      maxQuantity,
      status,
    } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Add-on ID is required.",
        },
        { status: 400 }
      );
    }

    const allowedCategories = [
      "Furniture",
      "Branding",
      "Electricity",
      "Other",
    ];

    const allowedStatuses = [
      "active",
      "inactive",
    ];

    if (
      category &&
      !allowedCategories.includes(category)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid add-on category.",
        },
        { status: 400 }
      );
    }

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid add-on status.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericMaxQuantity = Number(maxQuantity);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid price.",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(numericMaxQuantity) ||
      numericMaxQuantity < 1
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Maximum quantity must be at least 1.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const addOn = await AddOn.findById(id);

    if (!addOn) {
      return Response.json(
        {
          success: false,
          message: "Add-on not found.",
        },
        { status: 404 }
      );
    }

    if (name?.trim()) {
      const duplicate = await AddOn.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return Response.json(
          {
            success: false,
            message:
              "Another add-on already uses this name.",
          },
          { status: 409 }
        );
      }

      addOn.name = name.trim();
    }

    addOn.description =
      description?.trim() || "";

    addOn.price = numericPrice;

    addOn.category =
      category || addOn.category;

    addOn.maxQuantity =
      numericMaxQuantity;

    addOn.status =
      status || addOn.status;

    await addOn.save();

    return Response.json({
      success: true,
      message: "Add-on updated successfully.",
      addOn,
    });
  } catch (error) {
    console.error("Update add-on error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update add-on.",
      },
      { status: 500 }
    );
  }
}