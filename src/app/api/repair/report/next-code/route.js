import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function formatRepairCode(sequence) {
  const next = Math.max(1, Number(sequence) || 1);
  return `R-${String(next).padStart(4, "0")}`;
}

export async function GET() {
  try {
    const rows = await query(
      `SELECT repair_code FROM repair_requests ORDER BY id DESC LIMIT 1`
    );

    let nextSequence = 1;
    if (rows.length) {
      const lastCode = rows[0]?.repair_code || "";
      const match = /R-(\d+)/i.exec(lastCode);
      if (match) {
        nextSequence = Number(match[1]) + 1;
      }
    }

    const nextCode = formatRepairCode(nextSequence);
    return NextResponse.json(
      { nextCode },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to resolve next repair code", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างเลขแจ้งซ่อมได้" },
      { status: 500 }
    );
  }
}
