import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET() {
  try {
    await connectDB();

    const application = await Application.create({
      businessName: "Test Exhibition Business",
      contactPerson: "Test User",
      mobile: "9876543210",
      email: "test@example.com",
      category: "Clothing",
      description: "This is a test application.",
      instagram: "@testbusiness",
      socialMedia: "",
    });

    return Response.json({
      success: true,
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to create application",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}