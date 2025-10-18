import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const factoryIdParam = searchParams.get("factoryId");
    const factoryId = factoryIdParam ? Number(factoryIdParam) : null;

    if (factoryIdParam && (!Number.isInteger(factoryId) || factoryId <= 0)) {
      return NextResponse.json(
        { error: "รหัสโรงงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    let departments;
    if (factoryId) {
      departments = await query(
        `SELECT d.id,
                d.name,
                d.code,
                d.note,
                d.is_active AS isActive,
                d.factory_id AS factoryId
         FROM departments d
         WHERE d.factory_id = ?
         ORDER BY d.name ASC`,
        [factoryId]
      );
    } else {
      departments = await query(
        `SELECT d.id,
                d.name,
                d.code,
                d.note,
                d.is_active AS isActive,
                d.factory_id AS factoryId,
                f.name AS factoryName
         FROM departments d
         INNER JOIN factories f ON d.factory_id = f.id
         ORDER BY f.name ASC, d.name ASC`
      );
    }

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("[departments] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลแผนกได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const factoryId = Number(body?.factoryId);
    const code = body?.code ? String(body.code).trim() : null;
    const note = body?.note ? String(body.note).trim() : null;

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกโรงงาน" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อแผนก" },
        { status: 400 }
      );
    }

    const factory = await query("SELECT id, name FROM factories WHERE id = ?", [factoryId]);
    if (!factory.length) {
      return NextResponse.json(
        { error: "ไม่พบโรงงานที่เลือก" },
        { status: 404 }
      );
    }

    const duplicate = await query(
      "SELECT id FROM departments WHERE factory_id = ? AND name = ?",
      [factoryId, name]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีชื่อแผนกนี้อยู่แล้วในโรงงานที่เลือก" },
        { status: 409 }
      );
    }

    await query(
      `INSERT INTO departments (factory_id, name, code, note)
       VALUES (?, ?, ?, ?)`,
      [factoryId, name, code, note]
    );

    const [department] = await query(
      `SELECT d.id,
              d.name,
              d.code,
              d.note,
              d.is_active AS isActive,
              d.factory_id AS factoryId,
              f.name AS factoryName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
       WHERE d.factory_id = ? AND d.name = ?
       ORDER BY d.id DESC
       LIMIT 1`,
      [factoryId, name]
    );

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("[departments] POST error", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มแผนกได้" },
      { status: 500 }
    );
  }
}
