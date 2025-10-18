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
      `SELECT
         u.id,
         u.username,
         u.password_hash AS passwordHash,
         u.email,
         u.role,
         u.status,
         u.factory_id AS factoryId,
         f.name AS factoryName,
         u.department_id AS departmentId,
         d.name AS departmentName,
         u.division_id AS divisionId,
         dv.name AS divisionName
       FROM users u
       LEFT JOIN factories f ON u.factory_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN divisions dv ON u.division_id = dv.id
       WHERE u.username = ?
       LIMIT 1`,
      [trimmedUsername]
    );

    if (!users.length) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const user = users[0];
    if (user.status && user.status !== "active") {
      return NextResponse.json({ error: "บัญชีนี้ถูกระงับการใช้งาน" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        factoryId: user.factoryId,
        factoryName: user.factoryName,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        divisionId: user.divisionId,
        divisionName: user.divisionName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
