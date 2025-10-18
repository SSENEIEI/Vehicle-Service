import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, initDatabase } from "@/lib/db";

const ALLOWED_ROLES = new Set(["admin", "staff", "viewer"]);

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const email = body.email ? String(body.email).trim() : null;
    const role = ALLOWED_ROLES.has(body.role) ? body.role : "staff";

    if (!username || !password) {
      return NextResponse.json({ error: "กรุณาระบุ username และ password" }, { status: 400 });
    }

    const duplicate = await query("SELECT id FROM users WHERE username = ?", [username]);
    if (duplicate.length) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
      [username, passwordHash, email, role]
    );

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
