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

export async function PUT(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = Number(body?.id);
    const name = String(body?.name || "").trim();
    const codeProvided = body?.code !== undefined;
    const noteProvided = body?.note !== undefined;
    const isActiveProvided = body?.isActive !== undefined;
    const code = codeProvided ? String(body.code || "").trim() || null : undefined;
    const note = noteProvided ? String(body.note || "").trim() || null : undefined;
    const isActive = isActiveProvided ? (body.isActive ? 1 : 0) : undefined;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสโรงงานไม่ถูกต้อง" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อโรงงาน" }, { status: 400 });
    }

    const existing = await query("SELECT id FROM factories WHERE id = ?", [id]);
    if (!existing.length) {
      return NextResponse.json({ error: "ไม่พบโรงงาน" }, { status: 404 });
    }

    const duplicate = await query("SELECT id FROM factories WHERE name = ? AND id <> ?", [name, id]);
    if (duplicate.length) {
      return NextResponse.json({ error: "มีชื่อโรงงานนี้อยู่แล้ว" }, { status: 409 });
    }

    const updateFields = ["name = ?"];
    const params = [name];

    if (codeProvided) {
      updateFields.push("code = ?");
      params.push(code);
    }

    if (noteProvided) {
      updateFields.push("note = ?");
      params.push(note);
    }

    if (isActiveProvided) {
      updateFields.push("is_active = ?");
      params.push(isActive);
    }

    params.push(id);
    await query(`UPDATE factories SET ${updateFields.join(", ")} WHERE id = ?`, params);

    const [factory] = await query(
      `SELECT id, name, code, note, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
       FROM factories
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ factory });
  } catch (error) {
    console.error("[factories] PUT error", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขโรงงานได้" },
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
      return NextResponse.json({ error: "รหัสโรงงานไม่ถูกต้อง" }, { status: 400 });
    }

    const factory = await query("SELECT id FROM factories WHERE id = ?", [id]);
    if (!factory.length) {
      return NextResponse.json({ error: "ไม่พบโรงงาน" }, { status: 404 });
    }

    const [{ total: departmentCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM departments WHERE factory_id = ?",
      [id]
    );

    if (Number(departmentCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีแผนกอยู่ในโรงงานนี้ กรุณาลบแผนกก่อน" },
        { status: 409 }
      );
    }

    const [{ total: userCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM users WHERE factory_id = ?",
      [id]
    );

    if (Number(userCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีผู้ใช้ผูกกับโรงงานนี้ กรุณาย้ายหรือเปลี่ยนโรงงานของผู้ใช้ก่อน" },
        { status: 409 }
      );
    }

    const result = await query("DELETE FROM factories WHERE id = ?", [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่สามารถลบโรงงานได้" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[factories] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบโรงงานได้" },
      { status: 500 }
    );
  }
}
