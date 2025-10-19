import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { initDatabase, query } from "@/lib/db";

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

function invalidResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  await initDatabase();
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
                b.ga_status AS gaStatus,
                b.created_at AS createdAt,
                f.name AS factoryName,
                d.name AS divisionName,
                dept.name AS departmentName
         FROM bookings b
         INNER JOIN factories f ON f.id = b.factory_id
         INNER JOIN divisions d ON d.id = b.division_id
         INNER JOIN departments dept ON dept.id = b.department_id
         WHERE b.id = ?
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

    const whereClauses = [];
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

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return invalidResponse("รูปแบบข้อมูลไม่ถูกต้อง", 400);
  }

  const employeeId = String(body?.employeeId || "").trim();
  const requesterName = String(body?.requesterName || "").trim();
  const factoryId = Number.parseInt(body?.factoryId, 10);
  const divisionId = Number.parseInt(body?.divisionId, 10);
  const departmentId = Number.parseInt(body?.departmentId, 10);
  const contactPhone = String(body?.contactPhone || "").trim();
  const contactEmail = sanitizeEmail(body?.contactEmail);
  const cargoDetails = String(body?.cargoDetails || "").trim();
  const additionalEmailsRaw = Array.isArray(body?.additionalEmails) ? body.additionalEmails : [];

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
  if (!adminEmail) {
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
  if (!adminEmail) {
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

  const referenceCode = generateReferenceCode();
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

  let bookingId;
  try {
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
         ga_driver_name,
         ga_driver_phone,
         ga_vehicle_id,
         ga_vehicle_type,
         ga_status,
         ga_reject_reason,
         created_by
       ) VALUES (?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 'pending', NULL, ?)`
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
          requesterName,
        ]
    );

    bookingId = insertResult?.insertId;

    if (!bookingId) {
      throw new Error("ไม่สามารถบันทึกข้อมูลการจองได้");
    }

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
       ) VALUES (?, 'pickup', ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        bookingId,
        pickupPoint.sequenceNo,
        pickupPoint.travelDate,
        pickupPoint.departTime,
        pickupPoint.passengerCount,
        pickupPoint.passengerNames,
        pickupPoint.locationName,
        pickupPoint.district,
        pickupPoint.province,
        pickupPoint.flightNumber,
        pickupPoint.flightTime,
        pickupPoint.driverNote,
      ]
    );

    await Promise.all(
      dropOffPoints.map((point) =>
        query(
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
           ) VALUES (?, 'dropoff', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          , [
            bookingId,
            point.sequenceNo,
            point.travelDate,
            point.departTime,
            point.arriveTime,
            point.passengerCount,
            point.passengerNames,
            point.locationName,
            point.district,
            point.province,
            point.flightNumber,
            point.flightTime,
            point.driverNote,
          ]
        )
      )
    );

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
      const error = new Error("ไม่สามารถส่งอีเมลแจ้งเตือนผู้ดูแลระบบได้");
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
        JSON.stringify({ contactPhone, contactEmail, additionalEmails }),
      ]
    );

    return NextResponse.json({ success: true, bookingId, referenceCode });
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
