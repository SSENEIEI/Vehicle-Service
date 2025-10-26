import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { put, del } from "@vercel/blob";
import { initDatabase, query } from "@/lib/db";
import { ensureBookingLockColumns, releaseExpiredLocks } from "@/lib/bookingLocks";

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
    await ensureBookingLockColumns();
    try {
      await releaseExpiredLocks();
    } catch (error) {
      console.error("[drivers] releaseExpiredLocks failed", error);
    }

    const drivers = await query(
      `SELECT id,
              name,
              phone,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_drivers
       ORDER BY created_at DESC`
    );

    const locks = await query(
      `SELECT id AS bookingId,
              ga_driver_id AS driverId,
              driver_locked_until AS lockedUntil
         FROM bookings
        WHERE ga_driver_id IS NOT NULL
          AND driver_locked_until IS NOT NULL
          AND driver_locked_until > NOW()`
    );

    const lockMap = new Map();
    for (const lock of locks) {
      if (!lock?.driverId) {
        continue;
      }
      lockMap.set(Number(lock.driverId), lock);
    }

    const enrichedDrivers = drivers.map((driver) => {
      const lock = lockMap.get(Number(driver.id));
      let lockedUntil = lock?.lockedUntil || null;
      if (lockedUntil instanceof Date) {
        lockedUntil = lockedUntil.toISOString();
      }
      return {
        ...driver,
        isLocked: Boolean(lock),
        lockedUntil,
        lockedByBookingId: lock?.bookingId || null,
      };
    });

    return NextResponse.json({ drivers: enrichedDrivers });
  } catch (error) {
    console.error("[drivers] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดรายชื่อพนักงานขับรถได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อพนักงานขับรถ" }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });
    }

    if (!imageFile || typeof imageFile !== "object") {
      return NextResponse.json({ error: "กรุณาเลือกรูปภาพ" }, { status: 400 });
    }

    const photoUrl = await uploadImage(imageFile, "company-drivers");

    await query(
      `INSERT INTO company_drivers (name, phone, photo_url)
       VALUES (?, ?, ?)` ,
      [name, phone, photoUrl]
    );

    const [driver] = await query(
      `SELECT id,
              name,
              phone,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_drivers
       WHERE name = ? AND phone = ?
       ORDER BY id DESC
       LIMIT 1`,
      [name, phone]
    );

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    console.error("[drivers] POST error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถเพิ่มพนักงานขับรถได้" },
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
    const phone = String(formData.get("phone") || "").trim();
    const imageFile = formData.get("image");

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "รหัสพนักงานขับรถไม่ถูกต้อง" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อพนักงานขับรถ" }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });
    }

    const existing = await query(
      `SELECT photo_url AS photoUrl FROM company_drivers WHERE id = ?`,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json({ error: "ไม่พบพนักงานขับรถ" }, { status: 404 });
    }

    let newPhotoUrl = null;
    let shouldDeleteOldPhoto = false;

    if (imageFile && typeof imageFile === "object" && imageFile.size) {
      newPhotoUrl = await uploadImage(imageFile, "company-drivers");
      shouldDeleteOldPhoto = Boolean(existing[0].photoUrl);
    }

    const params = [name, phone];
    const setFragments = ["name = ?", "phone = ?"];

    if (newPhotoUrl) {
      setFragments.push("photo_url = ?");
      params.push(newPhotoUrl);
    }

    params.push(id);

    await query(`UPDATE company_drivers SET ${setFragments.join(", ")} WHERE id = ?`, params);

    if (shouldDeleteOldPhoto) {
      try {
        await del(existing[0].photoUrl);
      } catch (removeError) {
        console.warn("[drivers] remove old photo failed", removeError);
      }
    }

    const [driver] = await query(
      `SELECT id,
              name,
              phone,
              photo_url AS photoUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM company_drivers
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ driver });
  } catch (error) {
    console.error("[drivers] PUT error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถแก้ไขข้อมูลพนักงานขับรถได้" },
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
      return NextResponse.json({ error: "รหัสพนักงานขับรถไม่ถูกต้อง" }, { status: 400 });
    }

    const existing = await query(
      `SELECT photo_url AS photoUrl FROM company_drivers WHERE id = ?`,
      [id]
    );

    if (!existing.length) {
      return NextResponse.json({ error: "ไม่พบพนักงานขับรถ" }, { status: 404 });
    }

    const result = await query(`DELETE FROM company_drivers WHERE id = ?`, [id]);
    if (!result?.affectedRows) {
      return NextResponse.json({ error: "ไม่สามารถลบพนักงานขับรถได้" }, { status: 500 });
    }

    if (existing[0].photoUrl) {
      try {
        await del(existing[0].photoUrl);
      } catch (removeError) {
        console.warn("[drivers] delete blob failed", removeError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[drivers] DELETE error", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบพนักงานขับรถได้" },
      { status: 500 }
    );
  }
}
