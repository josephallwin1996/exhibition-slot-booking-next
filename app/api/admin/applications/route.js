import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Category from "@/models/Category";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
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

    const admin = verifyAdminToken(token);

    if (!admin || admin.role !== "admin") {
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

    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    await connectDB();

    const query = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { businessName: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
      ];
    }

    const applications = await Application.find(query)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    const [
      total,
      pending,
      approved,
      rejected,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "rejected" }),
    ]);

    return Response.json({
      success: true,
      applications,
      stats: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("Admin applications error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load applications.",
      },
      {
        status: 500,
      }
    );
  }
}