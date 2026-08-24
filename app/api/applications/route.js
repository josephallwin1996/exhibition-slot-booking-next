import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Category from "@/models/Category";

import {
  sendApplicationSubmittedEmail,
  sendNewApplicationAdminEmail,
} from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      businessName,
      contactPerson,
      mobile,
      email,
      categoryId,
      description,
      instagram,
      socialMedia,
    } = body;

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (
      !businessName ||
      !mobile ||
      !email ||
      !categoryId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please fill in all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // --------------------------------------------------
    // Validate category
    // --------------------------------------------------

    const category = await Category.findOne({
      _id: categoryId,
    }).lean();

    if (!category) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid category selected.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // Check whether this email already has
    // an active application
    // --------------------------------------------------

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingApplication =
      await Application.findOne({
        email: normalizedEmail,
        status: {
          $in: ["pending", "approved"],
        },
      });

    if (existingApplication) {
      return Response.json(
        {
          success: false,
          message:
            "An application with this email address already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // Create application
    // --------------------------------------------------

    const application =
      await Application.create({
        businessName:
          businessName.trim(),

        contactPerson:
          contactPerson.trim(),

        mobile:
          mobile.trim(),

        email:
          normalizedEmail,

        categoryId:
          category._id,

        description:
          description.trim(),

        instagram:
          instagram?.trim() || "",

        socialMedia:
          socialMedia?.trim() || "",

        status: "pending",
      });

    // --------------------------------------------------
    // Emails
    // --------------------------------------------------

    try {
      await sendApplicationSubmittedEmail({
        name:
          application.contactPerson,

        email:
          application.email,

        businessName:
          application.businessName,

        category:
          category.name,
      });

      await sendNewApplicationAdminEmail({
        businessName:
          application.businessName,

        contactPerson:
          application.contactPerson,

        email:
          application.email,

        category:
          category.name,
      });
    } catch (emailError) {
      console.error(
        "Application email error:",
        emailError
      );
    }

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return Response.json(
      {
        success: true,
        message:
          "Application submitted successfully.",
        applicationId:
          application._id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Application submission error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}