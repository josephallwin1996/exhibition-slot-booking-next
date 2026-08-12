import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

export function createAdminToken(admin) {
  return jwt.sign(
    {
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}