import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Require JWT secret from environment (no dev fallback)
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error("Missing JWT_SECRET env var");
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Development bypass: allow a fixed account without hitting the database
    if (username === "adminga" && password === "12345") {
      const isAdmin = true;
      const user = { id: 0, username: "adminga", department: "AC", isAdmin, is_super_admin: 1, plant_id: null, department_id: null };
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          department: user.department,
          isAdmin,
          is_super_admin: 1,
          plant_id: null,
          department_id: null,
        },
        SECRET_KEY,
        { expiresIn: "1d" }
      );
      return NextResponse.json({ token, user });
    }

  const users = await query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0)
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );

  // Use role flags if present; fallback to legacy check
  const isAdmin = !!user.is_admin || (user.username === "adminscrap" && user.department === "AC");

    // Load multi-departments for the user
    let department_ids = [];
    try {
      const rows = await query('SELECT department_id FROM user_departments WHERE user_id = ?', [user.id]);
      department_ids = rows.map(r => r.department_id);
    } catch {}

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        department: user.department,
        isAdmin,
        is_super_admin: !!user.is_super_admin,
        plant_id: user.plant_id || null,
        department_id: user.department_id || null,
        department_ids,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        department: user.department,
        isAdmin,
        is_super_admin: !!user.is_super_admin,
        plant_id: user.plant_id || null,
        department_id: user.department_id || null,
        department_ids,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
