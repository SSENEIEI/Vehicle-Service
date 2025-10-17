import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, initDatabase } from "@/lib/db";

const SECRET_KEY = process.env.JWT_SECRET || "vehicle-service-dev-secret";

export async function POST(request) {
  try {
    await initDatabase();
    const { username, password } = await request.json();
    const trimmedUsername = String(username || "").trim();
    const rawPassword = String(password || "").trim();

    if (!trimmedUsername || !rawPassword) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
    }

    const users = await query(
      "SELECT id, username, password_hash, full_name, email, role, status FROM users WHERE username = ?",
      [trimmedUsername]
    );

    if (!users.length) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const user = users[0];
    if (user.status && user.status !== "active") {
      return NextResponse.json({ error: "บัญชีนี้ถูกระงับการใช้งาน" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(rawPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
