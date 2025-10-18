import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDatabase, query } from "@/lib/db";

const ALLOWED_ROLES = new Set(["admin", "user", "vendor"]);

export async function GET() {
  try {
    await initDatabase();
    const users = await query(
      `SELECT
         u.id,
         u.username,
         u.full_name AS fullName,
         u.email,
         u.role,
         u.status,
         u.created_at AS createdAt,
         u.updated_at AS updatedAt,
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
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[users] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดรายชื่อผู้ใช้ได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "").trim();
    const role = ALLOWED_ROLES.has(body?.role) ? body.role : "user";
    const fullName = body?.fullName ? String(body.fullName).trim() : null;
    const email = body?.email ? String(body.email).trim() : null;

    const factoryId = Number(body?.factoryId);
    const departmentId = Number(body?.departmentId);
    const divisionId = Number(body?.divisionId);

    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกโรงงาน" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกแผนก" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(divisionId) || divisionId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกฝ่าย" },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    const factory = await query("SELECT id FROM factories WHERE id = ?", [factoryId]);
    if (!factory.length) {
      return NextResponse.json(
        { error: "ไม่พบโรงงานที่เลือก" },
        { status: 404 }
      );
    }

    const department = await query(
      "SELECT id FROM departments WHERE id = ? AND factory_id = ?",
      [departmentId, factoryId]
    );
    if (!department.length) {
      return NextResponse.json(
        { error: "แผนกไม่สอดคล้องกับโรงงานที่เลือก" },
        { status: 400 }
      );
    }

    const division = await query(
      `SELECT dv.id
         FROM divisions dv
         INNER JOIN departments dp ON dv.department_id = dp.id
         WHERE dv.id = ? AND dv.department_id = ? AND dp.factory_id = ?`,
      [divisionId, departmentId, factoryId]
    );
    if (!division.length) {
      return NextResponse.json(
        { error: "ฝ่ายไม่สอดคล้องกับแผนก/โรงงานที่เลือก" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (username, password_hash, full_name, email, role, factory_id, department_id, division_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, passwordHash, fullName || username, email, role, factoryId, departmentId, divisionId]
    );

    const [createdUser] = await query(
      `SELECT
         u.id,
         u.username,
         u.full_name AS fullName,
         u.email,
         u.role,
         u.status,
         u.created_at AS createdAt,
         u.updated_at AS updatedAt,
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
      [username]
    );

    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    console.error("[users] POST error", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มผู้ใช้ได้" },
      { status: 500 }
    );
  }
}
