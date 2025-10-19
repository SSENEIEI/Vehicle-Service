import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const CODE_PATTERN = /R-(\d+)/i;

async function getNextRepairCode() {
  const rows = await query(
    `SELECT repair_code FROM repair_requests ORDER BY id DESC LIMIT 1`
  );

  let nextSequence = 1;
  if (rows.length) {
    const lastCode = rows[0]?.repair_code || "";
    const match = CODE_PATTERN.exec(lastCode);
    if (match) {
      nextSequence = Number(match[1]) + 1;
    }
  }

  return formatRepairCode(nextSequence);
}

function formatRepairCode(sequence) {
  const next = Math.max(1, Number(sequence) || 1);
  return `R-${String(next).padStart(4, "0")}`;
}

function sanitizeCostItems(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      description: String(item.description || "").trim(),
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      note: String(item.note || "").trim(),
      total: Number(item.total) || 0,
    }));
}

function sanitizeAttachments(rawAttachments) {
  const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];
  return attachments
    .filter((file) => file && typeof file === "object")
    .map((file) => ({
      name: String(file.name || ""),
      size: Number(file.size) || 0,
      type: String(file.type || ""),
    }));
}

export async function POST(request) {
  try {
    const body = await request.json();

    const vehicleRegistration = String(body?.vehicleRegistration || "").trim();
    const vehicleType = String(body?.vehicleType || "").trim();
    const priorityLevel = String(body?.priorityLevel || "").trim();
    const issueDescription = String(body?.issueDescription || "").trim();
    const reportDate = String(body?.reportDate || "").trim();
    const etaDate = String(body?.etaDate || "").trim();
    const subtotal = Number(body?.subtotal) || 0;
    const vatAmount = Number(body?.vatAmount) || 0;
    const netTotal = Number(body?.netTotal) || 0;

    if (!vehicleRegistration) {
      return NextResponse.json(
        { error: "กรุณากรอกทะเบียนรถ" },
        { status: 400 }
      );
    }

    if (!issueDescription) {
      return NextResponse.json(
        { error: "กรุณาระบุอาการหรือปัญหาที่พบ" },
        { status: 400 }
      );
    }

    if (!reportDate) {
      return NextResponse.json(
        { error: "กรุณาเลือกวันที่แจ้ง" },
        { status: 400 }
      );
    }

    const costItems = sanitizeCostItems(body?.costItems);
    const attachments = sanitizeAttachments(body?.attachments);

    let repairCode = String(body?.repairCode || "").trim();
    let attempts = 0;
    let lastError = null;

    while (attempts < 5) {
      const candidate = repairCode || (await getNextRepairCode());
      try {
      const result = await query(
       `INSERT INTO repair_requests
         (repair_code, vehicle_registration, vehicle_type, priority_level,
          issue_description, report_date, eta_date, cost_items,
          subtotal, vat_amount, net_total, attachments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            candidate,
            vehicleRegistration,
            vehicleType || null,
            priorityLevel || null,
            issueDescription,
            reportDate,
            etaDate || null,
            costItems.length ? JSON.stringify(costItems) : null,
            subtotal,
            vatAmount,
            netTotal,
            attachments.length ? JSON.stringify(attachments) : null,
          ]
        );

        return NextResponse.json({
          success: true,
          repairCode: candidate,
          id: result?.insertId || null,
        });
      } catch (error) {
        lastError = error;
        if (error?.code === "ER_DUP_ENTRY") {
          repairCode = "";
          attempts += 1;
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      console.error("Failed to persist repair report after retries", lastError);
    }

    return NextResponse.json(
      { error: "ไม่สามารถบันทึกเลขแจ้งซ่อมใหม่ได้" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Failed to create repair report", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
