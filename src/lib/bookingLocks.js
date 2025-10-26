import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { query } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const AUTO_CANCEL_REASON = "ระบบยกเลิกอัตโนมัติเนื่องจากไม่มีการยืนยันภายใน 2 ชั่วโมง";

let sendgridConfigured = false;

function sanitizeEmail(value) {
  const email = String(value || "").trim();
  return EMAIL_REGEX.test(email) ? email : null;
}

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
    console.error("[bookingLocks] configure sendgrid failed", error);
    return false;
  }
}

async function resolveAdminEmail() {
  let adminEmail = sanitizeEmail(process.env.BOOKING_ADMIN_EMAIL || process.env.ADMIN_EMAIL);
  if (adminEmail) {
    return adminEmail;
  }
  try {
    const [adminRow] = await query(
      `SELECT email
         FROM users
        WHERE role = 'admin' AND email IS NOT NULL AND email <> ''
        ORDER BY id ASC
        LIMIT 1`
    );
    adminEmail = sanitizeEmail(adminRow?.email);
    return adminEmail;
  } catch (error) {
    console.error("[bookingLocks] resolve admin email failed", error);
    return null;
  }
}

async function createMailContext() {
  const adminEmail = await resolveAdminEmail();
  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT || "587";
  const smtpPort = Number.parseInt(smtpPortRaw, 10);
  const smtpUser = process.env.SMTP_USER || undefined;
  const smtpPass = process.env.SMTP_PASS || undefined;
  const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  let fromAddress = sanitizeEmail(process.env.SMTP_FROM) || smtpUser || adminEmail || undefined;

  if (smtpHost && (!Number.isInteger(smtpPort) || smtpPort <= 0)) {
    console.error("[bookingLocks] invalid SMTP_PORT value");
    return null;
  }
  if (smtpHost && smtpUser && !smtpPass) {
    console.error("[bookingLocks] missing SMTP_PASS for authenticated SMTP");
    return null;
  }

  let transporter;
  try {
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
      if (!fromAddress) {
        fromAddress = adminEmail || "no-reply@vehicle-service.local";
      }
    }
  } catch (error) {
    console.error("[bookingLocks] create mail transporter failed", error);
    return null;
  }

  if (!fromAddress) {
    fromAddress = "no-reply@vehicle-service.local";
  }

  const templateId = (process.env.SENDGRID_TEMPLATE_ID || "").trim();
  const canUseSendgrid = Boolean(templateId && ensureSendgridConfigured());

  return {
    transporter,
    fromAddress,
    templateId,
    canUseSendgrid,
  };
}

export async function ensureBookingLockColumns() {
  const rows = await query(
    `SELECT COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME IN ('ga_driver_id', 'vehicle_locked_until', 'driver_locked_until', 'ga_status')`
  );

  const columnMap = new Map(rows.map((row) => [row.columnName, row.columnType]));

  if (!columnMap.has("ga_driver_id")) {
    await query(
      `ALTER TABLE bookings
       ADD COLUMN ga_driver_id INT NULL AFTER ga_driver_phone`
    );
  }

  const fkRows = await query(
    `SELECT CONSTRAINT_NAME AS constraintName
       FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND CONSTRAINT_NAME = 'fk_bookings_driver'`
  );

  if (!fkRows.length) {
    try {
      await query(
        `ALTER TABLE bookings
         ADD CONSTRAINT fk_bookings_driver FOREIGN KEY (ga_driver_id)
           REFERENCES company_drivers(id) ON DELETE SET NULL`
      );
    } catch (error) {
      console.warn("[bookingLocks] add fk_bookings_driver failed", error?.message || error);
    }
  }

  if (!columnMap.has("vehicle_locked_until")) {
    await query(
      `ALTER TABLE bookings
       ADD COLUMN vehicle_locked_until DATETIME NULL AFTER ga_vehicle_type`
    );
  }

  if (!columnMap.has("driver_locked_until")) {
    await query(
      `ALTER TABLE bookings
       ADD COLUMN driver_locked_until DATETIME NULL AFTER vehicle_locked_until`
    );
  }

  const gaStatusColumn = columnMap.get("ga_status");
  if (!gaStatusColumn || !gaStatusColumn.includes("cancelled")) {
    await query(
      `ALTER TABLE bookings
       MODIFY COLUMN ga_status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'`
    );
  }
}

export async function ensureVehicleAvailable(vehicleId, { excludeBookingId = null } = {}) {
  if (!vehicleId) {
    return;
  }
  const params = [vehicleId];
  let sql = `SELECT id, reference_code AS referenceCode, vehicle_locked_until AS vehicleLockedUntil
               FROM bookings
              WHERE ga_vehicle_id = ?
                AND ga_status IN ('pending', 'approved')
                AND vehicle_locked_until IS NOT NULL
                AND vehicle_locked_until > NOW()`;
  if (excludeBookingId) {
    sql += " AND id <> ?";
    params.push(excludeBookingId);
  }
  sql += " LIMIT 1";

  const [conflict] = await query(sql, params);
  if (conflict) {
    const error = new Error("รถคันนี้ถูกเลือกไปแล้ว กรุณาเลือกรถคันอื่น");
    error.status = 409;
    error.conflictBooking = conflict.id;
    return Promise.reject(error);
  }
}

export async function ensureDriverAvailable(driverId, { excludeBookingId = null } = {}) {
  if (!driverId) {
    return;
  }
  const params = [driverId];
  let sql = `SELECT id, reference_code AS referenceCode, driver_locked_until AS driverLockedUntil
               FROM bookings
              WHERE ga_driver_id = ?
                AND ga_status = 'approved'
                AND driver_locked_until IS NOT NULL
                AND driver_locked_until > NOW()`;
  if (excludeBookingId) {
    sql += " AND id <> ?";
    params.push(excludeBookingId);
  }
  sql += " LIMIT 1";

  const [conflict] = await query(sql, params);
  if (conflict) {
    const error = new Error("พนักงานขับรถถูกมอบหมายให้จองอื่นอยู่แล้ว");
    error.status = 409;
    error.conflictBooking = conflict.id;
    return Promise.reject(error);
  }
}

function buildAutoCancelMessage(booking) {
  const bookingTypeLabel = booking.bookingType === "company" ? "การจองรถบริษัทฯ" : "การจองรถเช่า";
  const recipientName = booking.requesterName || booking.requesterEmpNo || "ผู้จอง";
  const lines = [
    `เรียน ${recipientName},`,
    "",
    `${bookingTypeLabel} (รหัสอ้างอิง ${booking.referenceCode}) ถูกยกเลิกอัตโนมัติ`,
    "เนื่องจากไม่มีการยืนยันจากผู้ดูแลภายใน 2 ชั่วโมงที่กำหนด",
  ];
  lines.push("", "หากยังต้องการใช้รถ กรุณาทำรายการจองใหม่อีกครั้ง", "", "ขออภัยในความไม่สะดวก");
  return lines.join("\n");
}

export async function releaseExpiredLocks() {
  let mailContext = null;
  const autoCancelRows = await query(
    `SELECT b.id,
            b.reference_code AS referenceCode,
            b.booking_type AS bookingType,
            b.requester_name AS requesterName,
            b.requester_emp_no AS requesterEmpNo,
            b.contact_email AS contactEmail,
            b.contact_phone AS contactPhone,
            b.ga_driver_name AS gaDriverName,
            b.ga_driver_phone AS gaDriverPhone
       FROM bookings b
      WHERE b.ga_status = 'pending'
        AND b.vehicle_locked_until IS NOT NULL
        AND b.vehicle_locked_until < NOW()`
  );

  if (autoCancelRows.length) {
    mailContext = await createMailContext();
  }

  for (const booking of autoCancelRows) {
    try {
      await query(
        `UPDATE bookings
            SET ga_status = 'cancelled',
                ga_reject_reason = ?,
                vehicle_locked_until = NULL,
                driver_locked_until = NULL
          WHERE id = ?` ,
        [AUTO_CANCEL_REASON, booking.id]
      );

      await query(
        `INSERT INTO booking_history (booking_id, actor, action, details)
         VALUES (?, ?, ?, ?)` ,
        [
          booking.id,
          "System",
          "auto-cancel",
          JSON.stringify({ reason: AUTO_CANCEL_REASON }),
        ]
      );

      if (mailContext) {
        try {
          const notificationRows = await query(
            `SELECT email FROM booking_notifications WHERE booking_id = ?`,
            [booking.id]
          );
          const recipientSet = new Set();
          recipientSet.add(sanitizeEmail(booking.contactEmail));
          for (const row of notificationRows) {
            recipientSet.add(sanitizeEmail(row?.email));
          }
          const recipients = Array.from(recipientSet).filter(Boolean);
          if (recipients.length) {
            const primary = recipients[0];
            const cc = recipients.slice(1);
            const subject = `การจอง ${booking.referenceCode} ถูกยกเลิกอัตโนมัติ`;
            const text = buildAutoCancelMessage(booking);
            let delivered = false;
            if (mailContext.canUseSendgrid) {
              try {
                await sgMail.send({
                  from: mailContext.fromAddress,
                  to: primary,
                  cc: cc.length ? cc : undefined,
                  templateId: mailContext.templateId,
                  dynamicTemplateData: {
                    bookingType: booking.bookingType,
                    referenceCode: booking.referenceCode,
                    status: "cancelled",
                    statusLabel: "ยกเลิกอัตโนมัติ",
                    requesterName: booking.requesterName,
                    employeeId: booking.requesterEmpNo,
                    contactEmail: booking.contactEmail,
                    contactPhone: booking.contactPhone,
                    gaDriverName: booking.gaDriverName,
                    gaDriverPhone: booking.gaDriverPhone,
                    rejectReason: AUTO_CANCEL_REASON,
                  },
                });
                delivered = true;
              } catch (error) {
                console.error("[bookingLocks] sendgrid auto-cancel mail failed", error);
              }
            }

            if (!delivered) {
              await mailContext.transporter.sendMail({
                from: mailContext.fromAddress,
                to: primary,
                cc: cc.length ? cc : undefined,
                subject,
                text,
              });
            }
          }
        } catch (mailError) {
          console.error("[bookingLocks] auto-cancel mail dispatch failed", mailError);
        }
      }
    } catch (error) {
      console.error("[bookingLocks] auto cancel booking failed", error);
    }
  }

  const releaseRows = await query(
    `SELECT id
       FROM bookings
      WHERE ga_status = 'approved'
        AND (
          (vehicle_locked_until IS NOT NULL AND vehicle_locked_until < NOW()) OR
          (driver_locked_until IS NOT NULL AND driver_locked_until < NOW())
        )`
  );

  if (releaseRows.length) {
    const ids = releaseRows.map((row) => row.id);
    const placeholders = ids.map(() => "?").join(", ");
    try {
      await query(
        `UPDATE bookings
            SET vehicle_locked_until = NULL,
                driver_locked_until = NULL
          WHERE id IN (${placeholders})`,
        ids
      );
      await Promise.all(
        ids.map((bookingId) =>
          query(
            `INSERT INTO booking_history (booking_id, actor, action, details)
             VALUES (?, ?, ?, ?)` ,
            [bookingId, "System", "auto-release", JSON.stringify({ reason: "lock-expired" })]
          )
        )
      );
    } catch (error) {
      console.error("[bookingLocks] auto release failed", error);
    }
  }

  await query(
    `UPDATE bookings
        SET vehicle_locked_until = NULL,
            driver_locked_until = NULL
      WHERE ga_status IN ('rejected', 'cancelled')
        AND (vehicle_locked_until IS NOT NULL OR driver_locked_until IS NOT NULL)`
  ).catch((error) => {
    console.error("[bookingLocks] cleanup lock columns failed", error);
  });
}

export function addHours(date, hours) {
  const copy = new Date(date.getTime());
  copy.setHours(copy.getHours() + hours);
  return copy;
}

export function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatDateTimeForSql(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
