import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const factoryIdParam = searchParams.get("factoryId");
    const divisionIdParam = searchParams.get("divisionId");

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
      filters.push("d.factory_id = ?");
      params.push(factoryId);
    }

    if (divisionIdParam !== null) {
      const divisionId = Number(divisionIdParam);
      if (!Number.isInteger(divisionId) || divisionId <= 0) {
        return NextResponse.json(
          { error: "รหัสฝ่ายไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      filters.push("d.division_id = ?");
      params.push(divisionId);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const departments = await query(
      `SELECT d.id,
              d.name,
              d.code,
              d.note,
              d.is_active AS isActive,
              d.factory_id AS factoryId,
              d.division_id AS divisionId,
              f.name AS factoryName,
              dv.name AS divisionName
       FROM departments d
       INNER JOIN divisions dv ON d.division_id = dv.id
       INNER JOIN factories f ON d.factory_id = f.id
       ${whereClause}
       ORDER BY f.name ASC, dv.name ASC, d.name ASC`,
      params
    );

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
    const divisionId = Number(body?.divisionId);
    const code = body?.code ? String(body.code).trim() : null;
    const note = body?.note ? String(body.note).trim() : null;

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกโรงงาน" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(divisionId) || divisionId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกฝ่าย" },
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

    const division = await query(
      "SELECT id, factory_id AS factoryId FROM divisions WHERE id = ?",
      [divisionId]
    );
    if (!division.length) {
      return NextResponse.json(
        { error: "ไม่พบฝ่ายที่เลือก" },
        { status: 404 }
      );
    }

    if (division[0].factoryId !== factoryId) {
      return NextResponse.json(
        { error: "ฝ่ายไม่อยู่ในโรงงานที่เลือก" },
        { status: 400 }
      );
    }

    const duplicate = await query(
      "SELECT id FROM departments WHERE division_id = ? AND name = ?",
      [divisionId, name]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีชื่อแผนกนี้อยู่แล้วในฝ่ายที่เลือก" },
        { status: 409 }
      );
    }

    await query(
      `INSERT INTO departments (factory_id, division_id, name, code, note)
       VALUES (?, ?, ?, ?, ?)`,
      [factoryId, divisionId, name, code, note]
    );

    const [department] = await query(
      `SELECT d.id,
              d.name,
              d.code,
              d.note,
              d.is_active AS isActive,
              d.factory_id AS factoryId,
              f.name AS factoryName,
              d.division_id AS divisionId,
              dv.name AS divisionName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
       INNER JOIN divisions dv ON d.division_id = dv.id
       WHERE d.division_id = ? AND d.name = ?
       ORDER BY d.id DESC
       LIMIT 1`,
      [divisionId, name]
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
  const divisionId = Number(body?.divisionId);
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

    if (!Number.isInteger(divisionId) || divisionId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกฝ่าย" }, { status: 400 });
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

    const division = await query(
      "SELECT id, factory_id AS factoryId FROM divisions WHERE id = ?",
      [divisionId]
    );
    if (!division.length) {
      return NextResponse.json({ error: "ไม่พบฝ่ายที่เลือก" }, { status: 404 });
    }

    if (division[0].factoryId !== factoryId) {
      return NextResponse.json({ error: "ฝ่ายไม่อยู่ในโรงงานที่เลือก" }, { status: 400 });
    }

    const duplicate = await query(
      "SELECT id FROM departments WHERE division_id = ? AND name = ? AND id <> ?",
      [divisionId, name, id]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีชื่อแผนกนี้อยู่แล้วในฝ่ายที่เลือก" },
        { status: 409 }
      );
    }

    const updateFields = ["factory_id = ?", "division_id = ?", "name = ?"];
    const params = [factoryId, divisionId, name];

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

    const [updated] = await query(
      `SELECT d.id,
              d.name,
              d.code,
              d.note,
              d.is_active AS isActive,
              d.factory_id AS factoryId,
    f.name AS factoryName,
    d.division_id AS divisionId,
    dv.name AS divisionName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
  INNER JOIN divisions dv ON d.division_id = dv.id
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
