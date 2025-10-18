import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const factoryIdParam = searchParams.get("factoryId");
    const departmentIdParam = searchParams.get("departmentId");

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

    if (departmentIdParam !== null) {
      const departmentId = Number(departmentIdParam);
      if (!Number.isInteger(departmentId) || departmentId <= 0) {
        return NextResponse.json(
          { error: "รหัสแผนกไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      filters.push("dv.department_id = ?");
      params.push(departmentId);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const divisions = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              dv.department_id AS departmentId,
              f.name AS factoryName,
              d.name AS departmentName
       FROM divisions dv
       INNER JOIN departments d ON dv.department_id = d.id
       INNER JOIN factories f ON dv.factory_id = f.id
       ${whereClause}
       ORDER BY f.name ASC, d.name ASC, dv.name ASC`,
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
    const departmentId = Number(body?.departmentId);
    const factoryIdInput = body?.factoryId !== undefined ? Number(body.factoryId) : null;
    const code = body?.code ? String(body.code).trim() : null;
    const note = body?.note ? String(body.note).trim() : null;

    if (!name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อฝ่าย" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกแผนก" },
        { status: 400 }
      );
    }

    if (factoryIdInput !== null && (!Number.isInteger(factoryIdInput) || factoryIdInput <= 0)) {
      return NextResponse.json(
        { error: "รหัสโรงงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const departments = await query(
      `SELECT d.id, d.factory_id AS factoryId, f.name AS factoryName, d.name AS departmentName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
       WHERE d.id = ?
       LIMIT 1`,
      [departmentId]
    );

    if (!departments.length) {
      return NextResponse.json(
        { error: "ไม่พบแผนกที่เลือก" },
        { status: 404 }
      );
    }

    const { factoryId: departmentFactoryId, factoryName, departmentName } = departments[0];

    if (factoryIdInput !== null && departmentFactoryId !== factoryIdInput) {
      return NextResponse.json(
        { error: "แผนกไม่อยู่ในโรงงานที่เลือก" },
        { status: 400 }
      );
    }

    const duplicate = await query(
      "SELECT id FROM divisions WHERE department_id = ? AND name = ?",
      [departmentId, name]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีฝ่ายนี้อยู่แล้วในแผนกที่เลือก" },
        { status: 409 }
      );
    }

    await query(
      `INSERT INTO divisions (factory_id, department_id, name, code, note)
       VALUES (?, ?, ?, ?, ?)`,
      [departmentFactoryId, departmentId, name, code, note]
    );

    const [division] = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              dv.department_id AS departmentId,
              ? AS factoryName,
              ? AS departmentName
       FROM divisions dv
       WHERE dv.department_id = ? AND dv.name = ?
       ORDER BY dv.id DESC
       LIMIT 1`,
      [factoryName, departmentName, departmentId, name]
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
    const departmentId = Number(body?.departmentId);
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

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกแผนก" }, { status: 400 });
    }

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return NextResponse.json({ error: "กรุณาเลือกโรงงาน" }, { status: 400 });
    }

    const division = await query("SELECT id FROM divisions WHERE id = ?", [id]);
    if (!division.length) {
      return NextResponse.json({ error: "ไม่พบฝ่าย" }, { status: 404 });
    }

    const departmentRows = await query(
      `SELECT d.id, d.factory_id AS factoryId, f.name AS factoryName, d.name AS departmentName
       FROM departments d
       INNER JOIN factories f ON d.factory_id = f.id
       WHERE d.id = ?
       LIMIT 1`,
      [departmentId]
    );

    if (!departmentRows.length) {
      return NextResponse.json({ error: "ไม่พบแผนกที่เลือก" }, { status: 404 });
    }

    const { factoryId: departmentFactoryId } = departmentRows[0];
    if (departmentFactoryId !== factoryId) {
      return NextResponse.json(
        { error: "แผนกไม่อยู่ในโรงงานที่เลือก" },
        { status: 400 }
      );
    }

    const duplicate = await query(
      "SELECT id FROM divisions WHERE department_id = ? AND name = ? AND id <> ?",
      [departmentId, name, id]
    );
    if (duplicate.length) {
      return NextResponse.json(
        { error: "มีฝ่ายนี้อยู่แล้วในแผนกที่เลือก" },
        { status: 409 }
      );
    }

    const updateFields = ["factory_id = ?", "department_id = ?", "name = ?"];
    const params = [factoryId, departmentId, name];

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

    const [updated] = await query(
      `SELECT dv.id,
              dv.name,
              dv.code,
              dv.note,
              dv.is_active AS isActive,
              dv.factory_id AS factoryId,
              dv.department_id AS departmentId,
              f.name AS factoryName,
              d.name AS departmentName
       FROM divisions dv
       INNER JOIN factories f ON dv.factory_id = f.id
       INNER JOIN departments d ON dv.department_id = d.id
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
