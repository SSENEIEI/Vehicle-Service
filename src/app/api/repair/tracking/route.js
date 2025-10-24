import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const STATUS_SEQUENCE = ["pending", "waiting_repair", "completed"];
const STATUS_INFO = {
  pending: { label: "รออนุมัติ", background: "#ffd0cb", color: "#d64545" },
  waiting_repair: { label: "รอซ่อม", background: "#ffe9a9", color: "#8a6d1d" },
  completed: { label: "ซ่อมเสร็จ", background: "#c7f1d4", color: "#1f8243" },
};

const formatDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  if (str.length >= 10) {
    return str.slice(0, 10);
  }
  return str;
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

function decorateRepairRow(row) {
  if (!row) return null;
  const status = row.status || "pending";
  const statusMeta = STATUS_INFO[status] || STATUS_INFO.pending;

  return {
    id: row.id,
    repairCode: row.repairCode,
    vehicleRegistration: row.vehicleRegistration,
    vehicleType: row.vehicleType,
    priorityLevel: row.priorityLevel,
    issueDescription: row.issueDescription,
    createdBy: row.createdBy || null,
    reporterName: row.reporterName || row.createdBy || null,
    status,
    statusLabel: statusMeta.label,
    statusBackground: statusMeta.background,
    statusColor: statusMeta.color,
    reportDate: formatDate(row.reportDate),
    etaDate: formatDate(row.etaDate),
    completedDate: formatDate(row.completedDate),
    subtotal: toNumber(row.subtotal),
    vatAmount: toNumber(row.vatAmount),
    netTotal: toNumber(row.netTotal),
    garageId: row.garageId ? Number(row.garageId) : null,
    garageName: row.garageName || null,
    updatedAt: row.updatedAt ? formatDate(row.updatedAt) : null,
  };
}

function computeSummary(rows) {
  const summary = {
    total: 0,
    pending: 0,
    waitingRepair: 0,
    completed: 0,
    totalCost: 0,
  };

  if (!Array.isArray(rows) || !rows.length) {
    return summary;
  }

  for (const row of rows) {
    summary.total += 1;
    const statusKey = row.status || "pending";
    if (statusKey === "waiting_repair") {
      summary.waitingRepair += 1;
    } else if (statusKey === "completed") {
      summary.completed += 1;
    } else {
      summary.pending += 1;
    }
    summary.totalCost += toNumber(row.netTotal);
  }

  return summary;
}

async function fetchRepairs() {
  const rows = await query(
    `SELECT
       rr.id,
       rr.repair_code AS repairCode,
       rr.vehicle_registration AS vehicleRegistration,
       rr.vehicle_type AS vehicleType,
       rr.priority_level AS priorityLevel,
       rr.issue_description AS issueDescription,
       rr.status,
       rr.report_date AS reportDate,
       rr.eta_date AS etaDate,
       rr.completed_date AS completedDate,
       rr.subtotal,
       rr.vat_amount AS vatAmount,
       rr.net_total AS netTotal,
       rr.garage_id AS garageId,
       rr.updated_at AS updatedAt,
       rr.created_by AS createdBy,
       COALESCE(u.username, rr.created_by) AS reporterName,
       rg.name AS garageName
     FROM repair_requests rr
     LEFT JOIN repair_garages rg ON rr.garage_id = rg.id
     LEFT JOIN users u ON u.username = rr.created_by
     ORDER BY rr.created_at DESC`
  );

  return Array.isArray(rows) ? rows : [];
}

async function fetchRepairById(id) {
  const rows = await query(
    `SELECT
       rr.id,
       rr.repair_code AS repairCode,
       rr.vehicle_registration AS vehicleRegistration,
       rr.vehicle_type AS vehicleType,
       rr.priority_level AS priorityLevel,
       rr.issue_description AS issueDescription,
       rr.status,
       rr.report_date AS reportDate,
       rr.eta_date AS etaDate,
       rr.completed_date AS completedDate,
       rr.subtotal,
       rr.vat_amount AS vatAmount,
       rr.net_total AS netTotal,
       rr.garage_id AS garageId,
       rr.updated_at AS updatedAt,
       rr.created_by AS createdBy,
       COALESCE(u.username, rr.created_by) AS reporterName,
       rg.name AS garageName
     FROM repair_requests rr
     LEFT JOIN repair_garages rg ON rr.garage_id = rg.id
     LEFT JOIN users u ON u.username = rr.created_by
     WHERE rr.id = ?
     LIMIT 1`,
    [id]
  );

  return rows.length ? rows[0] : null;
}

export async function GET() {
  try {
    const rows = await fetchRepairs();
    const repairs = rows.map(decorateRepairRow);
    const summary = computeSummary(rows);

    return NextResponse.json({
      repairs,
      summary,
      statusInfo: STATUS_INFO,
    });
  } catch (error) {
    console.error("[repair/tracking] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลติดตามงานซ่อมได้" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const action = String(body?.action || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "รหัสรายการไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "กรุณาระบุการดำเนินการ" },
        { status: 400 }
      );
    }

    if (action === "advance-status") {
      const current = await fetchRepairById(id);
      if (!current) {
        return NextResponse.json(
          { error: "ไม่พบรายการแจ้งซ่อม" },
          { status: 404 }
        );
      }

      const currentStatus = current.status || "pending";
      const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
      const nextIndex =
        currentIndex >= 0
          ? Math.min(currentIndex + 1, STATUS_SEQUENCE.length - 1)
          : 0;
      const nextStatus = STATUS_SEQUENCE[nextIndex] || "pending";

      if (nextStatus === currentStatus) {
        return NextResponse.json({ success: true, repair: decorateRepairRow(current) });
      }

      const completedDate = nextStatus === "completed" ? new Date().toISOString().slice(0, 10) : null;
      await query(
        `UPDATE repair_requests SET status = ?, completed_date = ?, updated_at = NOW() WHERE id = ?`,
        [nextStatus, completedDate, id]
      );

      const updated = await fetchRepairById(id);
      return NextResponse.json({ success: true, repair: decorateRepairRow(updated) });
    }

    if (action === "assign-garage") {
      let garageId = body?.garageId;
      if (garageId === "") {
        garageId = null;
      }

      if (garageId !== null) {
        const numericGarageId = Number(garageId);
        if (!Number.isInteger(numericGarageId) || numericGarageId <= 0) {
          return NextResponse.json(
            { error: "รหัสอู่ไม่ถูกต้อง" },
            { status: 400 }
          );
        }

        const garages = await query(
          `SELECT id FROM repair_garages WHERE id = ? AND is_active = 1 LIMIT 1`,
          [numericGarageId]
        );

        if (!garages.length) {
          return NextResponse.json(
            { error: "ไม่พบอู่ที่เลือก" },
            { status: 404 }
          );
        }

        await query(
          `UPDATE repair_requests SET garage_id = ?, updated_at = NOW() WHERE id = ?`,
          [numericGarageId, id]
        );
      } else {
        await query(
          `UPDATE repair_requests SET garage_id = NULL, updated_at = NOW() WHERE id = ?`,
          [id]
        );
      }

      const updated = await fetchRepairById(id);
      return NextResponse.json({ success: true, repair: decorateRepairRow(updated) });
    }

    return NextResponse.json(
      { error: "รูปแบบการดำเนินการไม่รองรับ" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[repair/tracking] PATCH error", error);
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตข้อมูลได้" },
      { status: 500 }
    );
  }
}
