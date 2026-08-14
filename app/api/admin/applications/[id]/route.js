import crypto from "crypto";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import { verifyAdminToken } from "@/lib/auth";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email";

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

export async function GET(request, { params }) {
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

    const { id } = await params;

    await connectDB();

    const application = await Application.findById(id).populate("categoryId", "name").lean();

    if (!application) {
      return Response.json(
        {
          success: false,
          message: "Application not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load application.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();

    const { action, rejectionReason } = body;

    if (!["approve", "reject"].includes(action)) {
      return Response.json(
        {
          success: false,
          message: "Invalid action.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const application = await Application.findById(id);

    if (!application) {
      return Response.json(
        {
          success: false,
          message: "Application not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (application.status !== "pending") {
      return Response.json(
        {
          success: false,
          message: `Application has already been ${application.status}.`,
        },
        {
          status: 409,
        }
      );
    }

    if (action === "approve") {
      const bookingToken = crypto.randomBytes(32).toString("hex");

      application.status = "approved";
      application.bookingToken = bookingToken;
      application.approvedAt = new Date();
      application.rejectedAt = null;
      application.rejectionReason = "";

      await application.save();
      
      try {
        await sendApplicationApprovedEmail({
            name: application.contactPerson,
            email: application.email,
            businessName: application.businessName,
            bookingToken: application.bookingToken,
        });
        } catch (emailError) {
        console.error(
            "Approval email error:",
            emailError
        );
     }

      return Response.json({
        success: true,
        message: "Application approved successfully.",
        application: {
          _id: application._id,
          status: application.status,
          bookingToken: application.bookingToken,
        },
      });
    }

    if (action === "reject") {
      if (!rejectionReason?.trim()) {
        return Response.json(
          {
            success: false,
            message: "Please provide a rejection reason.",
          },
          {
            status: 400,
          }
        );
      }

      application.status = "rejected";
      application.rejectionReason = rejectionReason.trim();
      application.rejectedAt = new Date();
      application.approvedAt = null;
      application.bookingToken = null;

      await application.save();

    try {
        await sendApplicationRejectedEmail({
            name: application.contactPerson,
            email: application.email,
            businessName: application.businessName,
            rejectionReason: application.rejectionReason,
        });
        } 
    catch (emailError) {
        console.error(
            "Rejection email error:",
            emailError
        );
    }

      return Response.json({
        success: true,
        message: "Application rejected successfully.",
        application: {
          _id: application._id,
          status: application.status,
          rejectionReason: application.rejectionReason,
        },
      });
    }
  } catch (error) {
    console.error("Application update error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update application.",
      },
      {
        status: 500,
      }
    );
  }
}