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
      return NextResponse.json({ error: "รหัสแผนกไม่ถูกต้อง" }, { status: 400 });
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกโรงงาน" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อแผนก" }, { status: 400 });
    }

    const department = await query("SELECT id FROM departments WHERE id = ?", [id]);
    if (!department.length) {
      return NextResponse.json({ error: "ไม่พบแผนก" }, { status: 404 });
    }

    const factory = await query("SELECT id FROM factories WHERE id = ?", [factoryId]);
    if (!factory.length) {
      return NextResponse.json({ error: "ไม่พบโรงงานที่เลือก" }, { status: 404 });
    }

    const duplicate = await query(
      "SELECT id FROM departments WHERE factory_id = ? AND name = ? AND id <> ?",
      [factoryId, name, id]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีชื่อแผนกนี้อยู่แล้วในโรงงานที่เลือก" },
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
    await query(`UPDATE departments SET ${updateFields.join(", ")} WHERE id = ?`, params);
    await query("UPDATE divisions SET factory_id = ? WHERE department_id = ?", [factoryId, id]);

    const [updated] = await query(
      `SELECT d.id,
              d.name,
              d.code,
              d.note,
              d.is_active AS isActive,
              d.factory_id AS factoryId,
              f.name AS factoryName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
       WHERE d.id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ department: updated });
  } catch (error) {
    console.error("[departments] PUT error", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขแผนกได้" },
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
      return NextResponse.json({ error: "รหัสแผนกไม่ถูกต้อง" }, { status: 400 });
    }

    const department = await query("SELECT id FROM departments WHERE id = ?", [id]);
    if (!department.length) {
      return NextResponse.json({ error: "ไม่พบแผนก" }, { status: 404 });
    }

    const [{ total: divisionCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM divisions WHERE department_id = ?",
      [id]
    );

    if (Number(divisionCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีฝ่ายอยู่ในแผนกนี้ กรุณาลบฝ่ายก่อน" },
        { status: 409 }
      );
    }

    const [{ total: userCount = 0 } = {}] = await query(
      "SELECT COUNT(*) AS total FROM users WHERE department_id = ?",
      [id]
    );

    if (Number(userCount) > 0) {
      return NextResponse.json(
        { error: "ยังมีผู้ใช้ผูกกับแผนกนี้ กรุณาย้ายหรือเปลี่ยนแผนกของผู้ใช้ก่อน" },
        { status: 409 }
      );
    }

    const result = await query("DELETE FROM departments WHERE id = ?", [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่สามารถลบแผนกได้" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[departments] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบแผนกได้" },
      { status: 500 }
    );
  }
}
