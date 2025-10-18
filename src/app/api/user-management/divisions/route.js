import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const factoryIdParam = searchParams.get("factoryId");

    const filters = [];
    const params = [];

    if (factoryIdParam !== null) {
      const factoryId = Number(factoryIdParam);
      if (!Number.isInteger(factoryId) || factoryId <= 0) {
        return NextResponse.json(
          { error: "รหัสโรงงานไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      filters.push("dv.factory_id = ?");
      params.push(factoryId);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const divisions = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              f.name AS factoryName
       FROM divisions dv
       INNER JOIN factories f ON dv.factory_id = f.id
       ${whereClause}
       ORDER BY f.name ASC, dv.name ASC`,
      params
    );

    return NextResponse.json({ divisions });
  } catch (error) {
    console.error("[divisions] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลฝ่ายได้" },
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

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อฝ่าย" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json(
        { error: "รหัสโรงงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const factories = await query(
      "SELECT id, name FROM factories WHERE id = ?",
      [factoryId]
    );

    if (!factories.length) {
      return NextResponse.json(
        { error: "ไม่พบโรงงานที่เลือก" },
        { status: 404 }
      );
    }

    const duplicate = await query(
      "SELECT id FROM divisions WHERE factory_id = ? AND name = ?",
      [factoryId, name]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีฝ่ายนี้อยู่แล้วในโรงงานที่เลือก" },
        { status: 409 }
      );
    }

    await query(
      `INSERT INTO divisions (factory_id, name, code, note)
       VALUES (?, ?, ?, ?)`,
      [factoryId, name, code, note]
    );

    const [division] = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              f.name AS factoryName
       FROM divisions dv
       INNER JOIN factories f ON dv.factory_id = f.id
       WHERE dv.factory_id = ? AND dv.name = ?
       ORDER BY dv.id DESC
       LIMIT 1`,
      [factoryId, name]
    );

    return NextResponse.json({ division }, { status: 201 });
  } catch (error) {
    console.error("[divisions] POST error", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มฝ่ายได้" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const id = Number(body?.id);
    const factoryId = Number(body?.factoryId);
    const name = String(body?.name || "").trim();
    const codeProvided = body?.code !== undefined;
    const noteProvided = body?.note !== undefined;
    const isActiveProvided = body?.isActive !== undefined;
    const code = codeProvided ? String(body.code || "").trim() || null : undefined;
    const note = noteProvided ? String(body.note || "").trim() || null : undefined;
    const isActive = isActiveProvided ? (body.isActive ? 1 : 0) : undefined;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสฝ่ายไม่ถูกต้อง" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อฝ่าย" }, { status: 400 });
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกโรงงาน" }, { status: 400 });
    }

    const division = await query("SELECT id FROM divisions WHERE id = ?", [id]);
    if (!division.length) {
      return NextResponse.json({ error: "ไม่พบฝ่าย" }, { status: 404 });
    }

    const factoryRows = await query("SELECT id FROM factories WHERE id = ?", [factoryId]);
    if (!factoryRows.length) {
      return NextResponse.json({ error: "ไม่พบโรงงานที่เลือก" }, { status: 404 });
    }

    const duplicate = await query(
      "SELECT id FROM divisions WHERE factory_id = ? AND name = ? AND id <> ?",
      [factoryId, name, id]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีฝ่ายนี้อยู่แล้วในโรงงานที่เลือก" },
        { status: 409 }
      );
    }

    const updateFields = ["factory_id = ?", "name = ?"];
    const params = [factoryId, name];

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
    await query(`UPDATE divisions SET ${updateFields.join(", ")} WHERE id = ?`, params);

    await query(
      `UPDATE departments SET factory_id = ? WHERE division_id = ?`,
      [factoryId, id]
    );

    const [updated] = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              f.name AS factoryName
       FROM divisions dv
       INNER JOIN factories f ON dv.factory_id = f.id
       WHERE dv.id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ division: updated });
  } catch (error) {
    console.error("[divisions] PUT error", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขฝ่ายได้" },
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
      return NextResponse.json({ error: "รหัสฝ่ายไม่ถูกต้อง" }, { status: 400 });
    }

    const division = await query("SELECT id FROM divisions WHERE id = ?", [id]);
    if (!division.length) {
      return NextResponse.json({ error: "ไม่พบฝ่าย" }, { status: 404 });
    }

    const [{ total: departmentCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM departments WHERE division_id = ?",
      [id]
    );

    if (Number(departmentCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีแผนกผูกกับฝ่ายนี้ กรุณาลบหรือย้ายแผนกก่อน" },
        { status: 409 }
      );
    }

    const [{ total: userCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM users WHERE division_id = ?",
      [id]
    );

    if (Number(userCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีผู้ใช้ผูกกับฝ่ายนี้ กรุณาย้ายหรือเปลี่ยนฝ่ายของผู้ใช้ก่อน" },
        { status: 409 }
      );
    }

    const result = await query("DELETE FROM divisions WHERE id = ?", [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่สามารถลบฝ่ายได้" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[divisions] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบฝ่ายได้" },
      { status: 500 }
    );
  }
}
