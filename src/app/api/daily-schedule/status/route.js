import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import {
  ensureDailyScheduleStatusTable,
  getDailyScheduleStatus,
  markDailyScheduleComplete,
} from "@/lib/dailyScheduleStatus";

function normalizeDateInput(value) {
  if (typeof value !== "string") {
    return null;
  }
  const candidate = value.trim();
  if (!candidate) {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : null;
}

export async function POST(request) {
  try {
    await initDatabase();
    await ensureDailyScheduleStatusTable();

    const body = await request.json().catch(() => ({}));
    const scheduleDate = normalizeDateInput(body.date);
    if (!scheduleDate) {
      return NextResponse.json({ error: "กรุณาระบุวันที่ให้ถูกต้อง (YYYY-MM-DD)" }, { status: 400 });
    }

    const current = await getDailyScheduleStatus(scheduleDate);
    if (current.status === "complete") {
      return NextResponse.json({ status: "complete", completedAt: current.completedAt }, { status: 200 });
    }

    await markDailyScheduleComplete(scheduleDate);
    const updated = await getDailyScheduleStatus(scheduleDate);
    return NextResponse.json({ status: updated.status, completedAt: updated.completedAt }, { status: 200 });
  } catch (error) {
    console.error("[daily-schedule-status] update failed", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกสถานะได้" }, { status: 500 });
  }
}
