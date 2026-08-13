import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Slot from "@/models/Slot";
import Category from "@/models/Category";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking link.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const application = await Application.findOne({
      bookingToken: token,
      status: "approved",
    }).lean();

    if (!application) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid or expired booking link.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Dynamic category
     * -------------------------------------------------------
     */

    let categoryId = application.categoryId;
    let categoryName = application.category || "";

    /*
     * Get the dynamic category name.
     *
     * We intentionally don't use populate() here.
     */
    if (categoryId) {
      const category = await Category.findById(
        categoryId
      )
        .select("name")
        .lean();

      if (category) {
        categoryName = category.name;
      }
    }

    /*
     * -------------------------------------------------------
     * No dynamic category assigned
     * -------------------------------------------------------
     *
     * This is not an error.
     *
     * It simply means the application cannot see any
     * category-specific stalls yet.
     */

    if (!categoryId) {
      return Response.json({
        success: true,

        exhibitor: {
          businessName:
            application.businessName,

          contactPerson:
            application.contactPerson,

          category: categoryName,
        },

        slots: [],
      });
    }

    /*
     * -------------------------------------------------------
     * Find stalls belonging to this category
     * -------------------------------------------------------
     */

    const slots = await Slot.find({
      //category: categoryId,
    })
      .select(
        "slotNumber category price status position row column notes"
      )
      .populate("category", "name")
      .sort({
        position: 1,
        slotNumber: 1,
      })
      .lean();

    return Response.json({
      success: true,

      exhibitor: {
        businessName:
          application.businessName,

        contactPerson:
          application.contactPerson,

        category: categoryName,
      },

      slots,
    });
  } catch (error) {
    console.error(
      "Category slot availability error:",
      error
    );

    return Response.json(
      {
        success: false,

        /*
         * During development, return the actual
         * error so we can identify the problem.
         */
        message:
          error?.message ||
          "Unable to load category slots.",
      },
      {
        status: 500,
      }
    );
  }
}