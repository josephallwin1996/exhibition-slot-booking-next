import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({
      active: true,
    })
      .select("_id name")
      .sort({
        name: 1,
      })
      .lean();

    return Response.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load categories.",
      },
      {
        status: 500,
      }
    );
  }
}