import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          message: "Password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingAdmin) {
      return Response.json(
        {
          success: false,
          message: "Admin already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return Response.json(
      {
        success: true,
        message: "Admin created successfully.",
        adminId: admin._id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Admin setup error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create admin.",
      },
      {
        status: 500,
      }
    );
  }
}