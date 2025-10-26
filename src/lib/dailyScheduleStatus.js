import { query } from "@/lib/db";

export async function ensureDailyScheduleStatusTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS daily_schedule_statuses (
      schedule_date DATE PRIMARY KEY,
      status ENUM('on_process', 'complete') NOT NULL DEFAULT 'on_process',
      completed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

export async function getDailyScheduleStatus(scheduleDate) {
  if (!scheduleDate) {
    return { status: "on_process", completedAt: null };
  }
  const [row] = await query(
    `SELECT status, completed_at AS completedAt
       FROM daily_schedule_statuses
      WHERE schedule_date = ?
      LIMIT 1`,
    [scheduleDate]
  );
  if (!row) {
    return { status: "on_process", completedAt: null };
  }
  return {
    status: row.status === "complete" ? "complete" : "on_process",
    completedAt: row.completedAt,
  };
}

export async function markDailyScheduleComplete(scheduleDate) {
  if (!scheduleDate) {
    throw new Error("scheduleDate is required");
  }
  await query(
    `INSERT INTO daily_schedule_statuses (schedule_date, status, completed_at)
     VALUES (?, 'complete', NOW())
     ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = VALUES(completed_at)` ,
    [scheduleDate]
  );
}
