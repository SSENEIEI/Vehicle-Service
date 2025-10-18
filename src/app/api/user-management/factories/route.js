import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export async function GET() {
  try {
    await initDatabase();
    const factories = await query(
      `SELECT id, name, code, note, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
       FROM factories
       ORDER BY name ASC`
    );
    return NextResponse.json({ factories });
  } catch (error) {
    console.error("[factories] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลโรงงานได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const code = body?.code ? String(body.code).trim() : null;
    const note = body?.note ? String(body.note).trim() : null;

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อโรงงาน" },
        { status: 400 }
      );
    }

    const duplicate = await query("SELECT id FROM factories WHERE name = ?", [name]);
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีชื่อโรงงานนี้อยู่แล้ว" },
        { status: 409 }
      );
    }

    await query(
      `INSERT INTO factories (name, code, note)
       VALUES (?, ?, ?)`,
      [name, code, note]
    );

    const [factory] = await query(
      `SELECT id, name, code, note, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
       FROM factories
       WHERE name = ?
       LIMIT 1`,
      [name]
    );

    return NextResponse.json({ factory }, { status: 201 });
  } catch (error) {
    console.error("[factories] POST error", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มโรงงานได้" },
      { status: 500 }
    );
  }
}
