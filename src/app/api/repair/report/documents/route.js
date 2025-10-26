import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { put, del } from "@vercel/blob";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function sanitizeFileName(fileName = "") {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function resolveContentType(file) {
  const type = String(file?.type || "").trim();
  if (type && (ALLOWED_TYPES.has(type) || type.startsWith("application/"))) {
    return type;
  }
  return "application/octet-stream";
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์เอกสาร" }, { status: 400 });
    }

    if (!file.size) {
      return NextResponse.json({ error: "ไฟล์เอกสารว่างเปล่า" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ไฟล์ต้องมีขนาดไม่เกิน 15MB" }, { status: 400 });
    }

    const originalName = String(file.name || "document");
    const safeName = sanitizeFileName(originalName) || "document";
    const blobPath = `Documents/${Date.now()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = resolveContentType(file);

    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType,
    });

    return NextResponse.json({
      success: true,
      attachment: {
        url: blob.url,
        name: originalName,
        size: file.size,
        type: contentType,
      },
    });
  } catch (error) {
    console.error("[repair-documents] upload failed", error);
    return NextResponse.json(
      { error: "ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const url = String(body?.url || "").trim();

    if (!url) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการลบ" }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[repair-documents] remove failed", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
