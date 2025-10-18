import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { put, del } from "@vercel/blob";
import { initDatabase, query } from "@/lib/db";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function sanitizeFileName(fileName = "") {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadImage(file, folder) {
  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    throw new Error("ไฟล์รูปภาพไม่ถูกต้อง");
  }

  if (file.size === 0) {
    throw new Error("กรุณาเลือกรูปภาพ");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("ขนาดรูปภาพต้องไม่เกิน 5MB");
  }

  const name = sanitizeFileName(file.name || "image") || "image";
  const blobPath = `${folder}/${Date.now()}-${name}`;
  const arrayBuffer = await file.arrayBuffer();
  const blob = await put(blobPath, Buffer.from(arrayBuffer), {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return blob.url;
}

export async function GET() {
  try {
    await initDatabase();
    const vehicles = await query(
      `SELECT id,
              name,
              registration,
              vehicle_type AS vehicleType,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_vehicles
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("[vehicles] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลรถบริษัทได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const registration = String(formData.get("registration") || "").trim();
    const vehicleType = String(formData.get("vehicleType") || "").trim();
    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อรถ" }, { status: 400 });
    }

    if (!registration) {
      return NextResponse.json({ error: "กรุณาระบุทะเบียนรถ" }, { status: 400 });
    }

    if (!vehicleType) {
      return NextResponse.json({ error: "กรุณาระบุประเภทรถ" }, { status: 400 });
    }

    if (!imageFile || typeof imageFile !== "object") {
      return NextResponse.json({ error: "กรุณาเลือกรูปภาพ" }, { status: 400 });
    }

    const duplicate = await query(
      "SELECT id FROM company_vehicles WHERE registration = ?",
      [registration]
    );
    if (duplicate.length) {
      return NextResponse.json({ error: "ทะเบียนรถนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }

    const photoUrl = await uploadImage(imageFile, "company-vehicles");

    await query(
      `INSERT INTO company_vehicles (name, registration, vehicle_type, photo_url)
       VALUES (?, ?, ?, ?)` ,
      [name, registration, vehicleType, photoUrl]
    );

    const [vehicle] = await query(
      `SELECT id,
              name,
              registration,
              vehicle_type AS vehicleType,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_vehicles
       WHERE registration = ?
       ORDER BY id DESC
       LIMIT 1`,
      [registration]
    );

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("[vehicles] POST error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถเพิ่มรถบริษัทได้" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await initDatabase();
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const name = String(formData.get("name") || "").trim();
    const registration = String(formData.get("registration") || "").trim();
    const vehicleType = String(formData.get("vehicleType") || "").trim();
    const imageFile = formData.get("image");

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสรถบริษัทไม่ถูกต้อง" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อรถ" }, { status: 400 });
    }

    if (!registration) {
      return NextResponse.json({ error: "กรุณาระบุทะเบียนรถ" }, { status: 400 });
    }

    if (!vehicleType) {
      return NextResponse.json({ error: "กรุณาระบุประเภทรถ" }, { status: 400 });
    }

    const existing = await query(
      `SELECT registration, photo_url AS photoUrl FROM company_vehicles WHERE id = ?`,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json({ error: "ไม่พบรถบริษัท" }, { status: 404 });
    }

    const duplicate = await query(
      "SELECT id FROM company_vehicles WHERE registration = ? AND id <> ?",
      [registration, id]
    );
    if (duplicate.length) {
      return NextResponse.json({ error: "ทะเบียนรถนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }

    let newPhotoUrl = null;
    let shouldDeleteOldPhoto = false;

    if (imageFile && typeof imageFile === "object" && imageFile.size) {
      newPhotoUrl = await uploadImage(imageFile, "company-vehicles");
      shouldDeleteOldPhoto = Boolean(existing[0].photoUrl);
    }

    const params = [name, registration, vehicleType];
    const setFragments = [
      "name = ?",
      "registration = ?",
      "vehicle_type = ?"
    ];

    if (newPhotoUrl) {
      setFragments.push("photo_url = ?");
      params.push(newPhotoUrl);
    }

    params.push(id);

    await query(`UPDATE company_vehicles SET ${setFragments.join(", ")} WHERE id = ?`, params);

    if (shouldDeleteOldPhoto) {
      try {
        await del(existing[0].photoUrl);
      } catch (removeError) {
        console.warn("[vehicles] remove old photo failed", removeError);
      }
    }

    const [vehicle] = await query(
      `SELECT id,
              name,
              registration,
              vehicle_type AS vehicleType,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_vehicles
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("[vehicles] PUT error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถแก้ไขข้อมูลรถบริษัทได้" },
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
      return NextResponse.json({ error: "รหัสรถบริษัทไม่ถูกต้อง" }, { status: 400 });
    }

    const existing = await query(
      `SELECT photo_url AS photoUrl FROM company_vehicles WHERE id = ?`,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json({ error: "ไม่พบรถบริษัท" }, { status: 404 });
    }

    const result = await query(`DELETE FROM company_vehicles WHERE id = ?`, [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่สามารถลบรถบริษัทได้" }, { status: 500 });
    }

    if (existing[0].photoUrl) {
      try {
        await del(existing[0].photoUrl);
      } catch (removeError) {
        console.warn("[vehicles] delete blob failed", removeError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[vehicles] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบรถบริษัทได้" },
      { status: 500 }
    );
  }
}
