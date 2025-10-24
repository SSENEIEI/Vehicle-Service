import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(value) {
  return String(value || "").trim();
}

function sanitizeNullable(value) {
  const next = normalize(value);
  return next ? next : null;
}

export async function GET() {
  try {
    await initDatabase();
    const garages = await query(
      `SELECT id,
              name,
              contact_name AS contactName,
              phone,
              email,
              address,
              is_active AS isActive,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM repair_garages
       ORDER BY name ASC, created_at DESC`
    );

    return NextResponse.json({ garages });
  } catch (error) {
    console.error("[garages] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดรายชื่ออู่ได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();

    const name = normalize(body?.name);
    const contactName = sanitizeNullable(body?.contactName);
    const phone = sanitizeNullable(body?.phone);
    const email = sanitizeNullable(body?.email);
    const address = sanitizeNullable(body?.address);

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่ออู่" },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const duplicate = await query(
      `SELECT id FROM repair_garages WHERE name = ? LIMIT 1`,
      [name]
    );

    if (duplicate.length) {
      return NextResponse.json(
        { error: "ชื่ออู่นี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO repair_garages (name, contact_name, phone, email, address)
       VALUES (?, ?, ?, ?, ?)` ,
      [name, contactName, phone, email, address]
    );

    const insertedId = result?.insertId;
    if (!insertedId) {
      throw new Error("ไม่สามารถเพิ่มรายชื่ออู่ได้");
    }

    const [garage] = await query(
      `SELECT id,
              name,
              contact_name AS contactName,
              phone,
              email,
              address,
              is_active AS isActive,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM repair_garages
       WHERE id = ?
       LIMIT 1`,
      [insertedId]
    );

    return NextResponse.json({ garage }, { status: 201 });
  } catch (error) {
    console.error("[garages] POST error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถเพิ่มรายชื่ออู่ได้" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await initDatabase();
    const body = await request.json();

    const id = Number(body?.id);
    const name = normalize(body?.name);
    const contactName = sanitizeNullable(body?.contactName);
    const phone = sanitizeNullable(body?.phone);
    const email = sanitizeNullable(body?.email);
    const address = sanitizeNullable(body?.address);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "รหัสอู่ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่ออู่" },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT id FROM repair_garages WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลอู่" },
        { status: 404 }
      );
    }

    const duplicate = await query(
      `SELECT id FROM repair_garages WHERE name = ? AND id <> ? LIMIT 1`,
      [name, id]
    );

    if (duplicate.length) {
      return NextResponse.json(
        { error: "ชื่ออู่นี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    await query(
      `UPDATE repair_garages
       SET name = ?,
           contact_name = ?,
           phone = ?,
           email = ?,
           address = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, contactName, phone, email, address, id]
    );

    const [garage] = await query(
      `SELECT id,
              name,
              contact_name AS contactName,
              phone,
              email,
              address,
              is_active AS isActive,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM repair_garages
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ garage });
  } catch (error) {
    console.error("[garages] PUT error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถแก้ไขข้อมูลอู่ได้" },
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
      return NextResponse.json(
        { error: "รหัสอู่ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM repair_garages WHERE id = ?`,
      [id]
    );

    if (!result?.affectedRows) {
      return NextResponse.json(
        { error: "ไม่สามารถลบข้อมูลอู่ได้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[garages] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบข้อมูลอู่ได้" },
      { status: 500 }
    );
  }
}
