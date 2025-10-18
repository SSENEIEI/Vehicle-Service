import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDatabase, query } from "@/lib/db";

const ALLOWED_ROLES = new Set(["admin", "user", "vendor"]);
const ROOT_ADMIN_USERNAME = "gaservice";

const isRootAdminRecord = (user) => {
  if (!user) return false;
  const username = String(user.username || "").trim().toLowerCase();
  if (username === ROOT_ADMIN_USERNAME) {
    return true;
  }
  if (
    user.role === "admin" &&
    !user.factoryId &&
    !user.departmentId &&
    !user.divisionId
  ) {
    return true;
  }
  return false;
};

export async function GET() {
  try {
    await initDatabase();
    const users = await query(
      `SELECT
         u.id,
         u.username,
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
      `INSERT INTO users (username, password_hash, email, role, factory_id, department_id, division_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, passwordHash, email, role, factoryId, departmentId, divisionId]
    );

    const [createdUser] = await query(
      `SELECT
         u.id,
         u.username,
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

export async function PUT(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสผู้ใช้ไม่ถูกต้อง" }, { status: 400 });
    }

    const username = String(body?.username || "").trim();
    const passwordRaw = body?.password ? String(body.password).trim() : "";
    const emailProvided = body?.email !== undefined;
    const email = emailProvided ? String(body.email || "").trim() : undefined;

    if (!username) {
      return NextResponse.json({ error: "กรุณาระบุชื่อผู้ใช้" }, { status: 400 });
    }

    const [existingUser] = await query(
      `SELECT id, username, role, factory_id AS factoryId, department_id AS departmentId, division_id AS divisionId
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!existingUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const isRootAdmin = isRootAdminRecord(existingUser);

    if (isRootAdmin) {
      const duplicate = await query("SELECT id FROM users WHERE username = ? AND id <> ?", [username, id]);
      if (duplicate.length) {
        return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" }, { status: 409 });
      }

      const updateFields = ["username = ?"];
      const params = [username];

      if (emailProvided) {
        updateFields.push("email = ?");
        params.push(email || null);
      }

      if (passwordRaw) {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);
        updateFields.push("password_hash = ?");
        params.push(passwordHash);
      }

      params.push(id);
      await query(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, params);

      const [updatedUser] = await query(
        `SELECT
           u.id,
           u.username,
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
         WHERE u.id = ?
         LIMIT 1`,
        [id]
      );

      return NextResponse.json({ user: updatedUser });
    }

    const role = ALLOWED_ROLES.has(body?.role) ? body.role : null;
    const factoryId = Number(body?.factoryId);
    const departmentId = Number(body?.departmentId);
    const divisionId = Number(body?.divisionId);

    if (!role) {
      return NextResponse.json({ error: "บทบาทผู้ใช้ไม่ถูกต้อง" }, { status: 400 });
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกโรงงาน" }, { status: 400 });
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกแผนก" }, { status: 400 });
    }

    if (!Number.isInteger(divisionId) || divisionId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกฝ่าย" }, { status: 400 });
    }

    const duplicate = await query("SELECT id FROM users WHERE username = ? AND id <> ?", [username, id]);
    if (duplicate.length) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" }, { status: 409 });
    }

    const factory = await query("SELECT id FROM factories WHERE id = ?", [factoryId]);
    if (!factory.length) {
      return NextResponse.json({ error: "ไม่พบโรงงานที่เลือก" }, { status: 404 });
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

    const updateFields = ["username = ?", "role = ?", "factory_id = ?", "department_id = ?", "division_id = ?"];
    const params = [username, role, factoryId, departmentId, divisionId];

    if (emailProvided) {
      updateFields.push("email = ?");
      params.push(email || null);
    }

    if (passwordRaw) {
      const passwordHash = await bcrypt.hash(passwordRaw, 10);
      updateFields.push("password_hash = ?");
      params.push(passwordHash);
    }

    params.push(id);
    await query(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, params);

    const [updatedUser] = await query(
      `SELECT
         u.id,
         u.username,
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
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[users] PUT error", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขผู้ใช้ได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = Number(body?.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสผู้ใช้ไม่ถูกต้อง" }, { status: 400 });
    }

    const [user] = await query(
      `SELECT username, role, factory_id AS factoryId, department_id AS departmentId, division_id AS divisionId
         FROM users
         WHERE id = ?
         LIMIT 1`,
      [id]
    );

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    if (isRootAdminRecord(user)) {
      return NextResponse.json(
        { error: "ไม่สามารถลบผู้ดูแลระบบหลักได้" },
        { status: 403 }
      );
    }

    const result = await query("DELETE FROM users WHERE id = ?", [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[users] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบผู้ใช้ได้" },
      { status: 500 }
    );
  }
}
