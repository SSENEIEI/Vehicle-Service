import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { initDatabase, query } from "@/lib/db";
import {
  ensureBookingLockColumns,
  ensureVehicleAvailable,
  ensureDriverAvailable,
  releaseExpiredLocks,
  addHours,
  addDays,
  formatDateTimeForSql,
} from "@/lib/bookingLocks";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateReferenceCode() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB-${timePart}${randomPart}`;
}

function sanitizeEmail(value) {
  const email = String(value || "").trim();
  return EMAIL_REGEX.test(email) ? email : null;
}

function requiredText(value, label) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new Error(`กรุณาระบุ${label}`);
  }
  return text;
}

function optionalText(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length ? text : null;
}

function normalizeDateValue(value, label, { required = false } = {}) {
  if (value === null || value === undefined) {
    if (required) {
      throw new Error(`กรุณาระบุ${label}`);
    }
    return null;
  }
  const raw = String(value).trim();
  if (!raw) {
    if (required) {
      throw new Error(`กรุณาระบุ${label}`);
    }
    return null;
  }
  const candidate = raw.includes("T") ? raw.split("T")[0] : raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }
  throw new Error(`${label} ต้องอยู่ในรูปแบบ YYYY-MM-DD`);
}

function normalizeTimeValue(value, label, { required = false } = {}) {
  if (value === null || value === undefined) {
    if (required) {
      throw new Error(`กรุณาระบุ${label}`);
    }
    return null;
  }
  const raw = String(value).trim();
  if (!raw) {
    if (required) {
      throw new Error(`กรุณาระบุ${label}`);
    }
    return null;
  }
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }
  if (/^\d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`;
  }
  throw new Error(`${label} ต้องอยู่ในรูปแบบ HH:MM`);
}

function parsePositiveInt(value, label, { defaultValue = null } = {}) {
  const num = Number.parseInt(value, 10);
  if (Number.isInteger(num) && num > 0) {
    return num;
  }
  if (defaultValue !== null) {
    return defaultValue;
  }
  throw new Error(`${label} ต้องเป็นจำนวนเต็มมากกว่า 0`);
}

function parseOptionalPositiveInt(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const raw = String(value).trim();
  if (!raw) {
    return null;
  }
  const num = Number.parseInt(raw, 10);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function toLocalDate(dateStr, timeStr = "00:00:00") {
  if (!dateStr) {
    return null;
  }
  const [year, month, day] = dateStr.split("-").map((part) => Number.parseInt(part, 10));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  const timeParts = String(timeStr || "00:00:00")
    .split(":")
    .map((part) => Number.parseInt(part, 10) || 0);
  const [hour, minute, second] = [timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0];
  return new Date(year, month - 1, day, hour, minute, second);
}

function deriveTravelWindow(pickupPoint, dropOffPoints = []) {
  const now = new Date();
  const starts = [];
  const ends = [];

  if (pickupPoint?.travelDate) {
    const pickupDepart = toLocalDate(pickupPoint.travelDate, pickupPoint.departTime || "00:00:00");
    if (pickupDepart) {
      starts.push(pickupDepart);
      ends.push(pickupDepart);
    }
  }

  for (const point of dropOffPoints) {
    if (!point) {
      continue;
    }
    const baseDate = point.travelDate || pickupPoint?.travelDate || null;
    if (baseDate) {
      const departMoment = toLocalDate(baseDate, point.departTime || pickupPoint?.departTime || "00:00:00");
      if (departMoment) {
        starts.push(departMoment);
      }
      const arriveMoment = toLocalDate(baseDate, point.arriveTime || point.departTime || "23:59:59");
      if (arriveMoment) {
        ends.push(arriveMoment);
      }
    }
  }

  starts.sort((a, b) => a.getTime() - b.getTime());
  ends.sort((a, b) => a.getTime() - b.getTime());

  const start = starts.length ? starts[0] : now;
  const end = ends.length ? ends[ends.length - 1] : start;

  return { start, end };
}

function normalizePickupPoint(input) {
  if (!input || typeof input !== "object") {
    throw new Error("กรุณาระบุจุดรับขึ้นรถ");
  }

  const sequenceNo = parsePositiveInt(input.sequenceNo, "ลำดับจุดรับ", { defaultValue: 1 });
  const travelDate = normalizeDateValue(input.travelDate, "วันรถออก", { required: true });
  const departTime = normalizeTimeValue(input.departTime, "เวลารถออก", { required: true });
  const passengerCount = parsePositiveInt(input.passengerCount, "จำนวนผู้โดยสารขึ้นจุดนี้");
  const locationName = requiredText(input.locationName, "สถานที่รับ");
  const district = requiredText(input.district, "อำเภอ");
  const province = requiredText(input.province, "จังหวัด");

  return {
    sequenceNo,
    travelDate,
    departTime,
    passengerCount,
    passengerNames: optionalText(input.passengerNames),
    locationName,
    district,
    province,
    flightNumber: optionalText(input.flightNumber),
    flightTime: normalizeTimeValue(input.flightTime, "เวลาแลนดิ้ง (ต้นทาง)"),
    driverNote: optionalText(input.driverNote),
  };
}

function normalizeDropOffPoints(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("กรุณาระบุปลายทางอย่างน้อย 1 จุด");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`ข้อมูลปลายทางที่ ${index + 1} ไม่ถูกต้อง`);
    }
    const labelPrefix = index === 0 ? "ปลายทาง" : `ปลายทางที่ ${index + 1}`;
    const sequenceNo = parsePositiveInt(item.sequenceNo, "ลำดับปลายทาง", {
      defaultValue: index + 1,
    });
    const arriveTime = normalizeTimeValue(item.arriveTime, `${labelPrefix} - เวลาถึงปลายทาง`, {
      required: true,
    });
    const passengerCount = parsePositiveInt(item.passengerCount, `${labelPrefix} - จำนวนผู้โดยสาร`);

    return {
      sequenceNo,
      travelDate: normalizeDateValue(item.travelDate, `${labelPrefix} - วันที่เดินทาง`),
      departTime: normalizeTimeValue(item.departTime, `${labelPrefix} - เวลารถออก`),
      arriveTime,
      passengerCount,
      passengerNames: optionalText(item.passengerNames),
      locationName: requiredText(item.locationName, `${labelPrefix} - สถานที่รับ`),
      district: requiredText(item.district, `${labelPrefix} - อำเภอ`),
      province: requiredText(item.province, `${labelPrefix} - จังหวัด`),
      flightNumber: optionalText(item.flightNumber),
      flightTime: normalizeTimeValue(item.flightTime, `${labelPrefix} - เวลาแลนดิ้ง`),
      driverNote: optionalText(item.driverNote),
    };
  });
}

let sendgridConfigured = false;

function ensureSendgridConfigured() {
  if (sendgridConfigured) {
    return true;
  }
  const apiKey = (process.env.SENDGRID_API_KEY || "").trim();
  if (!apiKey) {
    return false;
  }
  try {
    sgMail.setApiKey(apiKey);
    sendgridConfigured = true;
    return true;
  } catch (error) {
    console.error("[bookings/company] configure sendgrid failed", error);
    return false;
  }
}

async function syncBookingPoints(bookingId, pickupPoint, dropOffPoints = []) {
  if (!bookingId) {
    throw new Error("bookingId is required when syncing booking points");
  }

  if (pickupPoint) {
    await query(
      `INSERT INTO booking_points (
         booking_id,
         point_type,
         sequence_no,
         travel_date,
         depart_time,
         arrive_time,
         passenger_count,
         passenger_names,
         location_name,
         district,
         province,
         flight_number,
         flight_time,
         note_to_driver
       ) VALUES (?, 'pickup', ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         travel_date = VALUES(travel_date),
         depart_time = VALUES(depart_time),
         arrive_time = VALUES(arrive_time),
         passenger_count = VALUES(passenger_count),
         passenger_names = VALUES(passenger_names),
         location_name = VALUES(location_name),
         district = VALUES(district),
         province = VALUES(province),
         flight_number = VALUES(flight_number),
         flight_time = VALUES(flight_time),
         note_to_driver = VALUES(note_to_driver)`
      , [
        bookingId,
        pickupPoint.sequenceNo,
        pickupPoint.travelDate || null,
        pickupPoint.departTime || null,
        pickupPoint.passengerCount || null,
        pickupPoint.passengerNames || null,
        pickupPoint.locationName || null,
        pickupPoint.district || null,
        pickupPoint.province || null,
        pickupPoint.flightNumber || null,
        pickupPoint.flightTime || null,
        pickupPoint.driverNote || null,
      ]
    );

    await query(
      `DELETE FROM booking_points
       WHERE booking_id = ? AND point_type = 'pickup' AND sequence_no <> ?`
      , [bookingId, pickupPoint.sequenceNo]
    );
  }

  const dropOffArray = Array.isArray(dropOffPoints) ? dropOffPoints : [];
  const sequenceSet = new Set();

  for (let index = 0; index < dropOffArray.length; index += 1) {
    const point = dropOffArray[index];
    const sequenceNoCandidate = Number.isInteger(point.sequenceNo)
      ? point.sequenceNo
      : Number.parseInt(point.sequenceNo, 10) || index + 1;
    const sequenceNo = sequenceNoCandidate > 0 ? sequenceNoCandidate : index + 1;
    sequenceSet.add(sequenceNo);

    await query(
      `INSERT INTO booking_points (
         booking_id,
         point_type,
         sequence_no,
         travel_date,
         depart_time,
         arrive_time,
         passenger_count,
         passenger_names,
         location_name,
         district,
         province,
         flight_number,
         flight_time,
         note_to_driver
       ) VALUES (?, 'dropoff', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         travel_date = VALUES(travel_date),
         depart_time = VALUES(depart_time),
         arrive_time = VALUES(arrive_time),
         passenger_count = VALUES(passenger_count),
         passenger_names = VALUES(passenger_names),
         location_name = VALUES(location_name),
         district = VALUES(district),
         province = VALUES(province),
         flight_number = VALUES(flight_number),
         flight_time = VALUES(flight_time),
         note_to_driver = VALUES(note_to_driver)`
      , [
        bookingId,
        sequenceNo,
        point.travelDate || null,
        point.departTime || null,
        point.arriveTime || null,
        point.passengerCount || null,
        point.passengerNames || null,
        point.locationName || null,
        point.district || null,
        point.province || null,
        point.flightNumber || null,
        point.flightTime || null,
        point.driverNote || null,
      ]
    );
  }

  const sequenceList = Array.from(sequenceSet);
  if (sequenceList.length) {
    const placeholders = sequenceList.map(() => "?").join(", ");
    await query(
      `DELETE FROM booking_points
       WHERE booking_id = ?
         AND point_type = 'dropoff'
         AND sequence_no NOT IN (${placeholders})`
      , [bookingId, ...sequenceList]
    );
  } else {
    await query(
      `DELETE FROM booking_points
       WHERE booking_id = ?
         AND point_type = 'dropoff'`
      , [bookingId]
    );
  }
}

function invalidResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  await initDatabase();
  await ensureBookingLockColumns();
  try {
    await releaseExpiredLocks();
  } catch (error) {
    console.error("[bookings/company] releaseExpiredLocks failed", error);
  }
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const statusParam = searchParams.get("status");

  try {
    if (idParam) {
      const bookingId = Number.parseInt(idParam, 10);
      if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return invalidResponse("รหัสการจองไม่ถูกต้อง", 400);
      }

      const [booking] = await query(
        `SELECT b.id,
                b.reference_code AS referenceCode,
                b.requester_emp_no AS requesterEmpNo,
                b.requester_name AS requesterName,
                b.factory_id AS factoryId,
                b.division_id AS divisionId,
                b.department_id AS departmentId,
                b.contact_phone AS contactPhone,
                b.contact_email AS contactEmail,
                b.cargo_details AS cargoDetails,
                b.ga_driver_id AS gaDriverId,
                b.ga_driver_name AS gaDriverName,
                b.ga_driver_phone AS gaDriverPhone,
                b.ga_vehicle_id AS gaVehicleId,
                b.ga_vehicle_type AS gaVehicleType,
                b.ga_status AS gaStatus,
                b.ga_reject_reason AS gaRejectReason,
                b.vehicle_locked_until AS vehicleLockedUntil,
                b.driver_locked_until AS driverLockedUntil,
                b.created_at AS createdAt,
                f.name AS factoryName,
                d.name AS divisionName,
                dept.name AS departmentName
         FROM bookings b
         INNER JOIN factories f ON f.id = b.factory_id
         INNER JOIN divisions d ON d.id = b.division_id
         INNER JOIN departments dept ON dept.id = b.department_id
         WHERE b.id = ?
           AND b.booking_type = 'company'
         LIMIT 1`,
        [bookingId]
      );

      if (!booking) {
        return invalidResponse("ไม่พบข้อมูลการจอง", 404);
      }

      const notificationRows = await query(
        `SELECT email FROM booking_notifications WHERE booking_id = ?`,
        [bookingId]
      );

      const notificationEmails = Array.from(
        new Set(notificationRows.map((row) => sanitizeEmail(row?.email)))
      ).filter(Boolean);

      const additionalEmails = notificationEmails.filter(
        (email) => email !== booking.contactEmail
      );

      const pointRows = await query(
  `SELECT id,
    point_type,
    sequence_no,
    travel_date,
    depart_time,
    arrive_time,
    passenger_count,
    passenger_names,
    location_name,
    district,
    province,
    flight_number,
    flight_time,
    note_to_driver
   FROM booking_points
   WHERE booking_id = ?
   ORDER BY CASE WHEN point_type = 'pickup' THEN 0 ELSE 1 END, sequence_no ASC`,
        [bookingId]
      );

      const pickupPoints = [];
      const dropOffPoints = [];

      for (const row of pointRows) {
        const basePoint = {
          id: row.id,
          sequenceNo: row.sequence_no,
          travelDate: row.travel_date || null,
          departTime: row.depart_time || null,
          arriveTime: row.arrive_time || null,
          passengerCount: row.passenger_count,
          passengerNames: row.passenger_names || "",
          locationName: row.location_name,
          district: row.district,
          province: row.province,
          flightNumber: row.flight_number || "",
          flightTime: row.flight_time || null,
          driverNote: row.note_to_driver || "",
        };

        if (row.point_type === "pickup") {
          pickupPoints.push(basePoint);
        } else if (row.point_type === "dropoff") {
          dropOffPoints.push(basePoint);
        }
      }

      return NextResponse.json({
        booking: {
          ...booking,
          additionalEmails,
          pickupPoints,
          dropOffPoints,
        },
      });
    }

    const status = (statusParam || "pending").toLowerCase();
    const allowedStatuses = new Set(["pending", "approved", "rejected", "all"]);
    if (!allowedStatuses.has(status)) {
      return invalidResponse("สถานะที่ระบุไม่ถูกต้อง", 400);
    }

    const whereClauses = ["b.booking_type = 'company'"];
    const params = [];
    if (status !== "all") {
      whereClauses.push("b.ga_status = ?");
      params.push(status);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const bookings = await query(
      `SELECT b.id,
        b.reference_code AS referenceCode,
        b.requester_emp_no AS requesterEmpNo,
        b.requester_name AS requesterName,
        b.contact_phone AS contactPhone,
        b.contact_email AS contactEmail,
        b.factory_id AS factoryId,
        b.division_id AS divisionId,
        b.department_id AS departmentId,
  b.ga_driver_id AS gaDriverId,
        b.ga_status AS gaStatus,
        b.created_at AS createdAt,
        f.name AS factoryName,
        d.name AS divisionName,
        dept.name AS departmentName
       FROM bookings b
       INNER JOIN factories f ON f.id = b.factory_id
       INNER JOIN divisions d ON d.id = b.division_id
       INNER JOIN departments dept ON dept.id = b.department_id
       ${whereSql}
       ORDER BY b.created_at DESC
       LIMIT 100`,
      params
    );

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[bookings/company] GET error", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลการจองได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await initDatabase();
  await ensureBookingLockColumns();
  try {
    await releaseExpiredLocks();
  } catch (error) {
    console.error("[bookings/company] releaseExpiredLocks failed", error);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return invalidResponse("รูปแบบข้อมูลไม่ถูกต้อง", 400);
  }

  const bookingIdRaw = Number.parseInt(body?.bookingId ?? body?.id ?? "", 10);
  const isUpdate = Number.isInteger(bookingIdRaw) && bookingIdRaw > 0;

  const employeeId = String(body?.employeeId || "").trim();
  const requesterName = String(body?.requesterName || "").trim();
  const factoryId = Number.parseInt(body?.factoryId, 10);
  const divisionId = Number.parseInt(body?.divisionId, 10);
  const departmentId = Number.parseInt(body?.departmentId, 10);
  const contactPhone = String(body?.contactPhone || "").trim();
  const contactEmail = sanitizeEmail(body?.contactEmail);
  const cargoDetails = String(body?.cargoDetails || "").trim();
  const additionalEmailsRaw = Array.isArray(body?.additionalEmails) ? body.additionalEmails : [];

  const gaDriverId = parseOptionalPositiveInt(body?.gaDriverId ?? body?.selectedDriverId);
  const gaDriverName = String(body?.gaDriverName || "").trim();
  const gaDriverPhone = String(body?.gaDriverPhone || "").trim();
  const gaVehicleTypeRaw = String(body?.gaVehicleType || "").trim();
  const gaVehicleIdCandidate = Number.parseInt(String(body?.gaVehicleId ?? "").trim(), 10);
  const gaVehicleId = Number.isFinite(gaVehicleIdCandidate) && gaVehicleIdCandidate > 0 ? gaVehicleIdCandidate : null;
  const gaRejectReason = String(body?.gaRejectReason || "").trim();
  const gaStatusRaw = String(body?.gaStatus || "").trim().toLowerCase();
  let gaStatus = gaStatusRaw;

  let pickupPoint;
  let dropOffPoints;

  if (!employeeId) {
    return invalidResponse("กรุณาระบุรหัสพนักงาน");
  }
  if (!requesterName) {
    return invalidResponse("กรุณาระบุชื่อผู้จอง");
  }
  if (!Number.isInteger(factoryId) || factoryId <= 0) {
    return invalidResponse("กรุณาเลือกโรงงาน");
  }
  if (!Number.isInteger(divisionId) || divisionId <= 0) {
    return invalidResponse("กรุณาเลือกฝ่าย");
  }
  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return invalidResponse("กรุณาเลือกแผนก");
  }
  if (!contactPhone) {
    return invalidResponse("กรุณาระบุเบอร์ติดต่อกลับ");
  }
  if (!contactEmail) {
    return invalidResponse("กรุณาระบุอีเมลติดต่อกลับที่ถูกต้อง");
  }

  if (isUpdate) {
    if (!["approved", "rejected"].includes(gaStatus)) {
      return invalidResponse("กรุณาเลือกสถานะการจอง (อนุมัติหรือไม่อนุมัติ)");
    }
    if (!gaDriverName) {
      return invalidResponse("กรุณาระบุพนักงานขับรถ");
    }
    if (!gaDriverPhone) {
      return invalidResponse("กรุณาระบุเบอร์โทรพนักงานขับรถ");
    }
    if (!gaVehicleId) {
      return invalidResponse("กรุณาเลือกรถที่ใช้");
    }
    if (!gaVehicleTypeRaw) {
      return invalidResponse("กรุณาระบุประเภทรถ");
    }
    if (gaStatus === "rejected" && !gaRejectReason) {
      return invalidResponse("กรุณาระบุเหตุผลการไม่อนุมัติ");
    }
  } else {
    gaStatus = "pending";
  }

  try {
    pickupPoint = normalizePickupPoint(body?.pickupPoint);
    dropOffPoints = normalizeDropOffPoints(body?.dropOffPoints);
  } catch (error) {
    return invalidResponse(error?.message || "ข้อมูลเส้นทางไม่ถูกต้อง");
  }

  const additionalEmails = Array.from(
    new Set(
      additionalEmailsRaw
        .map((email) => sanitizeEmail(email))
        .filter((email) => Boolean(email) && email !== contactEmail)
    )
  );

  let adminEmail = sanitizeEmail(process.env.BOOKING_ADMIN_EMAIL || process.env.ADMIN_EMAIL);
  if (!adminEmail && !isUpdate) {
    try {
      const [adminRow] = await query(
        `SELECT email
         FROM users
         WHERE role = 'admin' AND email IS NOT NULL AND email <> ''
         ORDER BY id ASC
         LIMIT 1`
      );
      adminEmail = sanitizeEmail(adminRow?.email);
    } catch (lookupError) {
      console.error("[bookings/company] admin email lookup failed", lookupError);
    }
  }
  if (!adminEmail && !isUpdate) {
    return invalidResponse("ยังไม่ได้กำหนดอีเมลผู้ดูแลระบบ (BOOKING_ADMIN_EMAIL หรือ ADMIN_EMAIL)", 500);
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT || "587";
  const smtpPort = Number.parseInt(smtpPortRaw, 10);
  const smtpUser = process.env.SMTP_USER || undefined;
  const smtpPass = process.env.SMTP_PASS || undefined;
  const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  const smtpFrom = (process.env.SMTP_FROM || smtpUser || adminEmail || contactEmail || "").trim();

  if (smtpHost && (!Number.isInteger(smtpPort) || smtpPort <= 0)) {
    return invalidResponse("ค่าพอร์ต SMTP ไม่ถูกต้อง", 500);
  }
  if (smtpHost && smtpUser && !smtpPass) {
    return invalidResponse("กรุณากำหนด SMTP_PASS สำหรับการยืนยันตัวตน SMTP", 500);
  }

  const [organization] = await query(
    `SELECT f.id AS factoryId,
            f.name AS factoryName,
            d.id AS divisionId,
            d.name AS divisionName,
            dept.id AS departmentId,
            dept.name AS departmentName
     FROM factories f
     INNER JOIN divisions d ON d.factory_id = f.id
     INNER JOIN departments dept ON dept.division_id = d.id
     WHERE f.id = ? AND d.id = ? AND dept.id = ?
     LIMIT 1`,
    [factoryId, divisionId, departmentId]
  );

  if (!organization) {
    return invalidResponse("ข้อมูลโรงงาน/ฝ่าย/แผนกไม่สอดคล้องกัน", 400);
  }

  let transporter;
  let fromAddress = smtpFrom || contactEmail;
  if (smtpHost) {
    const transporterConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
    };
    if (smtpUser) {
      transporterConfig.auth = { user: smtpUser, pass: smtpPass };
    }
    transporter = nodemailer.createTransport(transporterConfig);
  } else {
    transporter = nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: process.env.SENDMAIL_PATH || "/usr/sbin/sendmail",
    });
    fromAddress = contactEmail;
  }

  const templateId = (process.env.SENDGRID_TEMPLATE_ID || "").trim();
  const canUseSendgrid = Boolean(templateId && ensureSendgridConfigured());

  if (isUpdate) {
    try {
      const [existingBooking] = await query(
        `SELECT id,
                booking_type AS bookingType,
                reference_code AS referenceCode,
                ga_vehicle_id AS gaVehicleId,
                ga_driver_id AS gaDriverId,
                ga_status AS gaStatus,
                vehicle_locked_until AS vehicleLockedUntil,
                driver_locked_until AS driverLockedUntil
         FROM bookings
         WHERE id = ?
         LIMIT 1`,
        [bookingIdRaw]
      );

      if (!existingBooking || existingBooking.bookingType !== "company") {
        return invalidResponse("ไม่พบข้อมูลการจอง", 404);
      }

      const { start: travelStart, end: travelEnd } = deriveTravelWindow(pickupPoint, dropOffPoints);

      let vehicleLockUntilValue = null;
      let driverLockUntilValue = null;
      const nextDriverId = gaStatus === "approved" ? gaDriverId : null;

      if (gaStatus === "approved") {
        await ensureVehicleAvailable(gaVehicleId, { excludeBookingId: bookingIdRaw });
        if (gaDriverId) {
          await ensureDriverAvailable(gaDriverId, { excludeBookingId: bookingIdRaw });
        }

        const now = new Date();
        const effectiveEnd = travelEnd && travelEnd instanceof Date ? travelEnd : travelStart;
        const baseMoment = effectiveEnd && effectiveEnd > now ? effectiveEnd : now;
        const vehicleLockDate = addHours(baseMoment, 2);
        vehicleLockUntilValue = formatDateTimeForSql(vehicleLockDate);

        if (gaDriverId) {
          const driverLockDate = addDays(baseMoment, 1);
          driverLockUntilValue = formatDateTimeForSql(driverLockDate);
        }
      } else {
        vehicleLockUntilValue = null;
        driverLockUntilValue = null;
      }

      await query(
        `UPDATE bookings
           SET requester_emp_no = ?,
               requester_name = ?,
               factory_id = ?,
               division_id = ?,
               department_id = ?,
               contact_phone = ?,
               contact_email = ?,
               cargo_details = ?,
               ga_driver_id = ?,
               ga_driver_name = ?,
               ga_driver_phone = ?,
               ga_vehicle_id = ?,
               ga_vehicle_type = ?,
               ga_status = ?,
               ga_reject_reason = ?,
               vehicle_locked_until = ?,
               driver_locked_until = ?
         WHERE id = ?`,
        [
          employeeId,
          requesterName,
          factoryId,
          divisionId,
          departmentId,
          contactPhone,
          contactEmail,
          cargoDetails || null,
          nextDriverId,
          gaDriverName || null,
          gaDriverPhone || null,
          gaVehicleId,
          gaVehicleTypeRaw || null,
          gaStatus,
          gaStatus === "rejected" ? gaRejectReason || null : null,
          vehicleLockUntilValue,
          gaStatus === "approved" ? driverLockUntilValue : null,
          bookingIdRaw,
        ]
      );

      await syncBookingPoints(bookingIdRaw, pickupPoint, dropOffPoints);

      const recipientEmails = Array.from(
        new Set([contactEmail, ...additionalEmails])
      );

      if (recipientEmails.length) {
        await Promise.all(
          recipientEmails.map((email) =>
            query(
              `INSERT INTO booking_notifications (booking_id, email, notified_at)
               VALUES (?, ?, NOW())
               ON DUPLICATE KEY UPDATE notified_at = VALUES(notified_at)`
              , [bookingIdRaw, email]
            )
          )
        );
      }

  const referenceCode = existingBooking.referenceCode;
      const statusLabel = gaStatus === "approved" ? "อนุมัติ" : "ไม่อนุมัติ";
      const templateData = {
        bookingType: "company",
        referenceCode,
        status: gaStatus,
        statusLabel,
        requesterName,
        employeeId,
        contactEmail,
        contactPhone,
        gaDriverName,
        gaDriverPhone,
        gaVehicleType: gaVehicleTypeRaw,
        gaVehicleId: gaVehicleId ? String(gaVehicleId) : "",
        rejectReason: gaStatus === "rejected" ? gaRejectReason || "-" : "",
        factoryName: organization.factoryName,
        divisionName: organization.divisionName,
        departmentName: organization.departmentName,
      };

      let statusMailDelivered = false;
      if (recipientEmails.length && canUseSendgrid) {
        try {
          await sgMail.send({
            from: fromAddress,
            to: recipientEmails[0],
            cc: recipientEmails.length > 1 ? recipientEmails.slice(1) : undefined,
            templateId,
            dynamicTemplateData: templateData,
          });
          statusMailDelivered = true;
        } catch (mailError) {
          console.error("[bookings/company] sendgrid status mail failed", mailError);
        }
      }

      if (recipientEmails.length && !statusMailDelivered) {
        const messageLines = [
          `เรียน ${requesterName || "ผู้จอง"},`,
          "",
          `สถานะการจองรถบริษัท (รหัสอ้างอิง ${referenceCode}) : ${statusLabel}`,
          `รหัสพนักงาน : ${employeeId}`,
          `เบอร์ติดต่อกลับ : ${contactPhone}`,
          `คนขับที่ได้รับมอบหมาย : ${gaDriverName} (${gaDriverPhone})`,
          `ประเภทรถ : ${gaVehicleTypeRaw || "-"}`,
        ];
        if (gaStatus === "rejected") {
          messageLines.push(`เหตุผลการไม่อนุมัติ : ${gaRejectReason || "-"}`);
        }
        messageLines.push(
          "",
          "หากมีข้อสงสัยเพิ่มเติมโปรดติดต่อ GA Service"
        );

        try {
          await transporter.sendMail({
            from: fromAddress,
            to: recipientEmails[0],
            cc: recipientEmails.length > 1 ? recipientEmails.slice(1) : undefined,
            subject: `สถานะการจองรถบริษัท (${referenceCode})`,
            text: messageLines.join("\n"),
          });
        } catch (fallbackError) {
          console.error("[bookings/company] fallback status mail failed", fallbackError);
        }
      }

      await query(
        `INSERT INTO booking_history (booking_id, actor, action, details)
         VALUES (?, ?, ?, ?)`
        , [
          bookingIdRaw,
          "GA Admin",
          `status-${gaStatus}`,
          JSON.stringify({
            gaDriverId: nextDriverId,
            gaDriverName,
            gaDriverPhone,
            gaVehicleId,
            gaVehicleType: gaVehicleTypeRaw,
            gaRejectReason: gaStatus === "rejected" ? gaRejectReason : null,
            vehicleLockedUntil: vehicleLockUntilValue,
            driverLockedUntil: gaStatus === "approved" ? driverLockUntilValue : null,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        bookingId: bookingIdRaw,
        referenceCode,
        gaStatus,
        vehicleLockedUntil: vehicleLockUntilValue,
        driverLockedUntil: gaStatus === "approved" ? driverLockUntilValue : null,
      });
    } catch (error) {
      console.error("[bookings/company] update error", error);
      return NextResponse.json(
        { error: error?.message || "ไม่สามารถอัปเดตสถานะการจองได้" },
        { status: error?.status || 500 }
      );
    }
  }

  const referenceCode = generateReferenceCode();

  let bookingId;
  try {
    let vehicleLockDuringCreate = null;
    let driverLockDuringCreate = null;

    const lockReference = new Date();

    if (gaVehicleId) {
      await ensureVehicleAvailable(gaVehicleId);
      vehicleLockDuringCreate = formatDateTimeForSql(addHours(lockReference, 2));
    }

    if (gaDriverId) {
      await ensureDriverAvailable(gaDriverId);
      driverLockDuringCreate = formatDateTimeForSql(addHours(lockReference, 2));
    }

    const insertResult = await query(
      `INSERT INTO bookings (
         reference_code,
         booking_type,
         requester_emp_no,
         requester_name,
         factory_id,
         division_id,
         department_id,
         contact_phone,
         contact_email,
         cargo_details,
         ga_driver_id,
         ga_driver_name,
         ga_driver_phone,
         ga_vehicle_id,
         ga_vehicle_type,
         vehicle_locked_until,
         driver_locked_until,
         ga_status,
         ga_reject_reason,
         created_by
       ) VALUES (?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)`
      , [
          referenceCode,
          employeeId,
          requesterName,
          factoryId,
          divisionId,
          departmentId,
          contactPhone,
          contactEmail,
          cargoDetails || null,
          gaDriverId,
          gaDriverName || null,
          gaDriverPhone || null,
          gaVehicleId,
          gaVehicleTypeRaw || null,
          vehicleLockDuringCreate,
          driverLockDuringCreate,
          requesterName,
        ]
    );

    bookingId = insertResult?.insertId;

    if (!bookingId) {
      throw new Error("ไม่สามารถบันทึกข้อมูลการจองได้");
    }
    await syncBookingPoints(bookingId, pickupPoint, dropOffPoints);

    const notificationRecipients = Array.from(
      new Set([adminEmail, contactEmail, ...additionalEmails])
    );
    const ccRecipients = notificationRecipients.filter((email) => email !== adminEmail);

    const messageLines = [
      "รายงานผู้ดูแลระบบ",
      "มีผู้ประสงค์ จองรถ",
      `รหัสพนักงาน : ${employeeId}`,
      `ชื่อผู้จอง : ${requesterName}`,
      `โรงงาน : ${organization.factoryName}`,
      `ฝ่าย : ${organization.divisionName}`,
      `แผนก : ${organization.departmentName}`,
      `เบอร์ติดต่อกลับ : ${contactPhone}`,
      `E-mail ติดต่อกลับ : ${contactEmail}`,
      `รหัสอ้างอิงการจอง : ${referenceCode}`,
      "",
      "โปรดเข้าระบบเพื่ออนุมัติการจอง",
    ];

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        cc: ccRecipients.length ? ccRecipients : undefined,
        subject: `แจ้งเตือนการจองรถบริษัท (${referenceCode})`,
        text: messageLines.join("\n"),
        replyTo: contactEmail,
      });
    } catch (mailError) {
      console.error("[bookings/company] send mail failed", mailError);
      const shouldRevealDetail =
        process.env.NODE_ENV !== "production" && mailError?.message;
      const errorMessage = shouldRevealDetail
        ? `ไม่สามารถส่งอีเมลแจ้งเตือนผู้ดูแลระบบได้ (${mailError.message})`
        : "ไม่สามารถส่งอีเมลแจ้งเตือนผู้ดูแลระบบได้";
      const error = new Error(errorMessage);
      error.status = 502;
      error.cause = mailError;
      throw error;
    }

    await Promise.all(
      notificationRecipients.map((email) =>
        query(
          `INSERT INTO booking_notifications (booking_id, email, notified_at)
           VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE notified_at = VALUES(notified_at)`
          , [bookingId, email]
        )
      )
    );

    await query(
      `INSERT INTO booking_history (booking_id, actor, action, details)
       VALUES (?, ?, ?, ?)`
      , [
        bookingId,
        requesterName || employeeId,
        "created",
        JSON.stringify({
          contactPhone,
          contactEmail,
          additionalEmails,
          gaVehicleId,
          gaDriverId,
          vehicleLockedUntil: vehicleLockDuringCreate,
          driverLockedUntil: driverLockDuringCreate,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      bookingId,
      referenceCode,
      vehicleLockedUntil: vehicleLockDuringCreate,
      driverLockedUntil: driverLockDuringCreate,
    });
  } catch (error) {
    if (bookingId) {
      try {
        await query("DELETE FROM bookings WHERE id = ?", [bookingId]);
      } catch (cleanupError) {
        console.error("[bookings/company] cleanup error", cleanupError);
      }
    }
    console.error("[bookings/company] POST error", error);
    return NextResponse.json(
      { error: error?.message || "ไม่สามารถบันทึกการจองได้" },
      { status: error?.status || 500 }
    );
  }
}
