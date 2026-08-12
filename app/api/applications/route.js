import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
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
      category,
      description,
      instagram,
      socialMedia,
    } = body;

    // Basic validation
    if (
      !businessName ||
      !contactPerson ||
      !mobile ||
      !email ||
      !category ||
      !description
    ) {
      return Response.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate category
    const allowedCategories = [
      "Jewellery",
      "Clothing",
      "Food",
      "Decor",
    ];

    if (!allowedCategories.includes(category)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category selected.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // Check whether this email already has an active application
    const existingApplication = await Application.findOne({
      email: email.toLowerCase().trim(),
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

    // Create application
    const application = await Application.create({
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      mobile: mobile.trim(),
      email: email.toLowerCase().trim(),
      category,
      description: description.trim(),
      instagram: instagram?.trim() || "",
      socialMedia: socialMedia?.trim() || "",
      status: "pending",
    });

    try {
        await sendApplicationSubmittedEmail({
            name: application.contactPerson,
            email: application.email,
            businessName: application.businessName,
            category: application.category,
        });

        await sendNewApplicationAdminEmail({
            businessName: application.businessName,
            contactPerson: application.contactPerson,
            email: application.email,
            category: application.category,
        });
    } 
    catch (emailError) {
     console.error("Application email error:", emailError);
    }

    return Response.json(
      {
        success: true,
        message: "Application submitted successfully.",
        applicationId: application._id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Application submission error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}