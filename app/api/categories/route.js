import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";

/*
=========================================================
ADMIN AUTHENTICATION
=========================================================
*/

async function authenticateAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const admin =
    verifyAdminToken(token);

  if (
    !admin ||
    admin.role !== "admin"
  ) {
    return null;
  }

  return admin;
}

/*
=========================================================
SLUG
=========================================================
*/

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}

/*
=========================================================
REGEX ESCAPE
=========================================================
*/

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/*
=========================================================
GET

Public:
GET /api/admin/categories

Returns active categories.

Admin:
GET /api/admin/categories?all=true

Returns all categories.

This allows the landing/apply page to use the same
endpoint without authentication.
=========================================================
*/

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const getAll =
      searchParams.get("all") === "true";

    /*
     * Public request
     *
     * Only active categories.
     */
    if (!getAll) {
      const categories =
        await Category.find({
          active: true,
        })
          .sort({
            position: 1,
            name: 1,
          })
          .select(
            "_id name slug description position active"
          )
          .lean();

      return Response.json({
        success: true,
        categories,
      });
    }

    /*
     * Admin request
     *
     * Authentication required.
     */
    const admin =
      await authenticateAdmin();

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

    const categories =
      await Category.find({})
        .sort({
          position: 1,
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

/*
=========================================================
POST

Admin:
Create category
=========================================================
*/

export async function POST(request) {
  try {
    const admin =
      await authenticateAdmin();

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

    const body =
      await request.json();

    const name =
      body?.name?.trim();

    const description =
      body?.description?.trim() ||
      "";

    const active =
      body?.active !== false;

    const position =
      Number.isFinite(
        Number(body?.position)
      )
        ? Number(body.position)
        : 0;

    if (!name) {
      return Response.json(
        {
          success: false,
          message:
            "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      createSlug(name);

    if (!slug) {
      return Response.json(
        {
          success: false,
          message:
            "Unable to generate a valid slug.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * Duplicate name
     */

    const existingName =
      await Category.findOne({
        name: {
          $regex: `^${escapeRegex(
            name
          )}$`,
          $options: "i",
        },
      });

    if (existingName) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Duplicate slug
     */

    const existingSlug =
      await Category.findOne({
        slug,
      });

    if (existingSlug) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await Category.create({
        name,
        slug,
        description,
        active,
        position,
      });

    return Response.json(
      {
        success: true,
        message:
          "Category created successfully.",
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create category error:",
      error
    );

    if (
      error?.code === 11000
    ) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this name or slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message:
          "Unable to create category.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
PATCH

Admin:
Update category

Body:

{
  id,
  name,
  description,
  active,
  position
}
=========================================================
*/

export async function PATCH(request) {
  try {
    const admin =
      await authenticateAdmin();

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

    const body =
      await request.json();

    const id = body?.id;

    if (!id) {
      return Response.json(
        {
          success: false,
          message:
            "Category ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * NAME
     */

    if (
      body.name !== undefined
    ) {
      const name =
        String(
          body.name
        ).trim();

      if (!name) {
        return Response.json(
          {
            success: false,
            message:
              "Category name cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      const duplicateName =
        await Category.findOne({
          _id: {
            $ne: category._id,
          },
          name: {
            $regex: `^${escapeRegex(
              name
            )}$`,
            $options: "i",
          },
        });

      if (duplicateName) {
        return Response.json(
          {
            success: false,
            message:
              "A category with this name already exists.",
          },
          {
            status: 409,
          }
        );
      }

      const slug =
        createSlug(name);

      if (!slug) {
        return Response.json(
          {
            success: false,
            message:
              "Unable to generate a valid slug.",
          },
          {
            status: 400,
          }
        );
      }

      const duplicateSlug =
        await Category.findOne({
          _id: {
            $ne: category._id,
          },
          slug,
        });

      if (duplicateSlug) {
        return Response.json(
          {
            success: false,
            message:
              "The generated slug is already in use.",
          },
          {
            status: 409,
          }
        );
      }

      category.name = name;
      category.slug = slug;
    }

    /*
     * DESCRIPTION
     */

    if (
      body.description !==
      undefined
    ) {
      category.description =
        String(
          body.description
        ).trim();
    }

    /*
     * ACTIVE
     */

    if (
      body.active !== undefined
    ) {
      category.active =
        Boolean(body.active);
    }

    /*
     * POSITION
     */

    if (
      body.position !==
      undefined
    ) {
      const position =
        Number(
          body.position
        );

      if (
        !Number.isFinite(
          position
        ) ||
        position < 0
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Position must be a valid number greater than or equal to 0.",
          },
          {
            status: 400,
          }
        );
      }

      category.position =
        position;
    }

    await category.save();

    return Response.json({
      success: true,
      message:
        "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error(
      "Update category error:",
      error
    );

    if (
      error?.code === 11000
    ) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this name or slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message:
          "Unable to update category.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
DELETE

Admin:

Body:

{
  id
}
=========================================================
*/

export async function DELETE(request) {
  try {
    const admin =
      await authenticateAdmin();

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

    const body =
      await request.json();

    const id = body?.id;

    if (!id) {
      return Response.json(
        {
          success: false,
          message:
            "Category ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    await Category.findByIdAndDelete(
      id
    );

    return Response.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}