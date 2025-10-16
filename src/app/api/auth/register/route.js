//src\app\api\auth\register\route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password, department } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO users (username, password, department, is_admin, is_super_admin) VALUES (?, ?, ?, 0, 0)",
      [username, hashedPassword, department]
    );

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
