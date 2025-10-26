import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { initDatabase, query } from "@/lib/db";
import DailyScheduleStatusControl from "./DailyScheduleStatusControl";
import {
  ensureDailyScheduleStatusTable,
  getDailyScheduleStatus,
} from "@/lib/dailyScheduleStatus";
import {
  FaCalendarDay,
  FaClipboardList,
  FaFileExcel,
} from "react-icons/fa6";
import { FaCamera } from "react-icons/fa";

export const metadata = {
  title: "แผนจัดรถประจำวัน | Vehicle Service",
};

const colors = {
  surface: "#ffffff",
  border: "#d5dfee",
  accent: "#f4f7fc",
  textDark: "#1d2f4b",
  textMuted: "#5a6c8f",
  headerDate: "#0b1533",
  headerVehicle: "#2d9251",
  headerTravel: "#f29c38",
  headerDriver: "#1b6b36",
  headerBooking: "#182744",
  vehicleColumn: "#d9f0d8",
  pickupColumn: "#ffe6c4",
  dropoffColumn: "#ffd7a0",
  driverColumn: "#cae9bd",
  bookingColumn: "#203260",
  statusComplete: "#1f8243",
  statusCompleteBg: "#d4f3e0",
  statusProgress: "#b76e00",
  statusProgressBg: "#fff1d0",
  statusEmpty: "#475569",
  statusEmptyBg: "#e2e8f0",
  statusOnProcess: "#dc2626",
  statusOnProcessBg: "#fee2e2",
};

const dashboardStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    backgroundColor: colors.surface,
    borderRadius: "24px",
    border: `1px solid ${colors.border}`,
    padding: "24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: colors.textDark,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "22px",
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  statusControls: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  statusLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
  },
  statusBadge: (variant) => {
    const palette = {
      complete: {
        backgroundColor: colors.statusCompleteBg,
        color: colors.statusComplete,
      },
      on_process: {
        backgroundColor: colors.statusOnProcessBg,
        color: colors.statusOnProcess,
      },
      progress: {
        backgroundColor: colors.statusProgressBg,
        color: colors.statusProgress,
      },
      empty: {
        backgroundColor: colors.statusEmptyBg,
        color: colors.statusEmpty,
      },
    };
    const choice = palette[variant] || palette.on_process;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "18px",
      padding: "8px 18px",
      fontWeight: "700",
      fontSize: "14px",
      backgroundColor: choice.backgroundColor,
      color: choice.color,
    };
  },
  dateForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dateInput: {
    height: "42px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "0 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: colors.surface,
  },
  dateSubmit: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "14px",
    border: "none",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    backgroundColor: colors.headerDriver,
    color: "#ffffff",
  },
  segmentControl: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: "999px",
    padding: "4px",
    border: `1px solid ${colors.border}`,
  },
  segmentButton: (active = false) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    border: "none",
    backgroundColor: active ? colors.headerBooking : "transparent",
    color: active ? "#ffffff" : colors.textDark,
    textDecoration: "none",
  }),
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionButton: (backgroundColor, color = "#ffffff") => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "16px",
    border: "none",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    backgroundColor,
    color,
  }),
  tableWrapper: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: `1px solid ${colors.border}`,
  },
  tableHeadCell: {
    fontSize: "14px",
    fontWeight: "700",
    padding: "12px 14px",
    textAlign: "center",
    border: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
  },
  tableCell: {
    fontSize: "14px",
    padding: "14px",
    border: `1px solid ${colors.border}`,
    minHeight: "52px",
    verticalAlign: "top",
  },
  tableCellMuted: {
    color: colors.textMuted,
  },
};

const vehicleHeaders = [
  { label: "ประเภทรถ", background: colors.vehicleColumn },
  { label: "รถ", background: colors.vehicleColumn },
  { label: "ทะเบียนรถ", background: colors.vehicleColumn },
];

const driverHeaders = [
  { label: "ชื่อคนขับ", background: colors.driverColumn },
  { label: "เบอร์โทร", background: colors.driverColumn },
];

const bookingHeaders = [
  { label: "คนจอง", background: colors.headerBooking, color: "#ffffff" },
  { label: "แผนก", background: colors.headerBooking, color: "#ffffff" },
  { label: "โรงงาน", background: colors.headerBooking, color: "#ffffff" },
];

const pickupColumnTemplates = [
  { label: "เวลารถออก", key: "time" },
  { label: "จุดที่", key: "location" },
  { label: "รายละเอียด", key: "detail" },
  { label: "หมายเหตุถึงคนขับ*ต้นทาง", key: "note" },
];

const dropoffColumnTemplates = [
  { label: "เวลารถออก", key: "time" },
  { label: "จุดที่", key: "location" },
  { label: "รายละเอียด", key: "detail" },
  { label: "หมายเหตุถึงคนขับ*ปลายทาง", key: "note" },
];

function formatThaiDate(date) {
  if (!date) {
    return "-";
  }
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

function formatDateParam(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeValue(value) {
  if (!value) {
    return "—";
  }
  const timeString = typeof value === "string" ? value : String(value);
  if (!timeString.includes(":")) {
    return timeString;
  }
  const [hours = "00", minutes = "00"] = timeString.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function formatPointDetail(point) {
  if (!point) {
    return "—";
  }
  const segments = [point.district, point.province].filter(Boolean);
  return segments.length ? segments.join(", ") : "—";
}

function normalizeText(value) {
  return value ? value : "—";
}

async function fetchDailyScheduleData(targetDateStr) {
  const bookingRows = await query(
    `SELECT b.id,
        b.booking_type AS bookingType,
        b.reference_code AS referenceCode,
        b.ga_vehicle_type AS vehicleType,
        b.ga_status AS gaStatus,
        b.ga_driver_name AS gaDriverName,
        b.ga_driver_phone AS gaDriverPhone,
        b.requester_name AS requesterName,
        b.rental_company AS rentalCompany,
        factories.name AS factoryName,
        departments.name AS departmentName,
        divisions.name AS divisionName,
        cv.name AS vehicleName,
        cv.registration AS vehicleRegistration,
        cd.name AS driverRecordName,
        cd.phone AS driverRecordPhone,
        earliest.first_depart_time AS firstDepartTime
    FROM bookings b
    LEFT JOIN factories ON factories.id = b.factory_id
    LEFT JOIN divisions ON divisions.id = b.division_id
    LEFT JOIN departments ON departments.id = b.department_id
    LEFT JOIN company_vehicles cv ON cv.id = b.ga_vehicle_id
    LEFT JOIN company_drivers cd ON cd.id = b.ga_driver_id
    LEFT JOIN (
      SELECT booking_id, MIN(depart_time) AS first_depart_time
      FROM booking_points
      WHERE point_type = 'pickup' AND travel_date = ?
      GROUP BY booking_id
    ) earliest ON earliest.booking_id = b.id
    WHERE EXISTS (
      SELECT 1
      FROM booking_points bp
      WHERE bp.booking_id = b.id AND bp.travel_date = ?
    )
    ORDER BY earliest.first_depart_time IS NULL,
      earliest.first_depart_time ASC,
      b.id ASC`,
    [targetDateStr, targetDateStr]
  );

  if (!bookingRows.length) {
    return [];
  }

  const bookingIds = bookingRows.map((row) => row.id);
  const placeholders = bookingIds.map(() => "?").join(",");
  // Allow drop-off rows with NULL travel_date so they still appear alongside pickups.
  const pointRows = await query(
    `SELECT bp.booking_id AS bookingId,
        bp.point_type AS pointType,
        bp.sequence_no AS sequenceNo,
        bp.depart_time AS departTime,
        bp.arrive_time AS arriveTime,
        bp.location_name AS locationName,
        bp.district AS district,
        bp.province AS province,
        bp.note_to_driver AS noteToDriver
    FROM booking_points bp
    WHERE bp.booking_id IN (${placeholders})
      AND (
        bp.travel_date = ?
        OR (bp.travel_date IS NULL AND bp.point_type = 'dropoff')
      )
    ORDER BY bp.booking_id ASC,
      FIELD(bp.point_type, 'pickup', 'dropoff'),
      bp.sequence_no ASC`,
    [...bookingIds, targetDateStr]
  );

  const pointsByBooking = new Map(
    bookingIds.map((id) => [id, { pickups: [], dropoffs: [] }])
  );

  for (const point of pointRows) {
    const target = pointsByBooking.get(point.bookingId);
    if (!target) {
      continue;
    }
    const detail = {
      sequenceNo: point.sequenceNo,
      departTime: point.departTime,
      arriveTime: point.arriveTime,
      locationName: point.locationName,
      district: point.district,
      province: point.province,
      note: point.noteToDriver,
    };
    if (point.pointType === "pickup") {
      target.pickups.push(detail);
    } else {
      target.dropoffs.push(detail);
    }
  }

  return bookingRows.map((row) => {
    const points = pointsByBooking.get(row.id) || {
      pickups: [],
      dropoffs: [],
    };
    return {
      id: row.id,
      bookingType: row.bookingType,
      referenceCode: row.referenceCode,
      vehicleType: row.vehicleType,
      vehicleName: row.vehicleName,
      vehicleRegistration: row.vehicleRegistration,
      rentalCompany: row.rentalCompany,
      gaStatus: row.gaStatus,
      driverName: row.gaDriverName || row.driverRecordName || null,
      driverPhone: row.gaDriverPhone || row.driverRecordPhone || null,
      requesterName: row.requesterName,
      departmentName: row.departmentName,
      factoryName: row.factoryName,
      divisionName: row.divisionName,
      firstDepartTime: row.firstDepartTime,
      pickups: points.pickups,
      dropoffs: points.dropoffs,
    };
  });
}

function buildFilterHref(dateStr, type) {
  const params = new URLSearchParams();
  if (dateStr) {
    params.set("date", dateStr);
  }
  if (type && type !== "all") {
    params.set("type", type);
  }
  const query = params.toString();
  return query ? `?${query}` : "?";
}

export default async function DailySchedulePage({ searchParams }) {
  const requestedDate = typeof searchParams?.date === "string" ? searchParams.date : undefined;
  const filterParamRaw = typeof searchParams?.type === "string" ? searchParams.type : "all";
  const filterType = ["company", "rental"].includes(filterParamRaw) ? filterParamRaw : "all";

  const today = new Date();
  const initialDate = requestedDate ? new Date(`${requestedDate}T00:00:00`) : today;
  const selectedDate = Number.isNaN(initialDate.getTime()) ? today : initialDate;
  const selectedDateStr = formatDateParam(selectedDate);
  const selectedDateLabel = formatThaiDate(selectedDate);

  await initDatabase();
  await ensureDailyScheduleStatusTable();
  const allBookings = await fetchDailyScheduleData(selectedDateStr);
  const filteredBookings = filterType === "all"
    ? allBookings
    : allBookings.filter((booking) => booking.bookingType === filterType);
  const scheduleStatus = await getDailyScheduleStatus(selectedDateStr);
  const statusStylesByVariant = {
    on_process: dashboardStyles.statusBadge("on_process"),
    complete: dashboardStyles.statusBadge("complete"),
  };

  const maxPickupPoints = Math.max(
    1,
    ...filteredBookings.map((booking) => booking.pickups.length)
  );
  const maxDropoffPoints = Math.max(
    1,
    ...filteredBookings.map((booking) => booking.dropoffs.length)
  );

  const pickupHeaders = [];
  for (let index = 0; index < maxPickupPoints; index += 1) {
    for (const template of pickupColumnTemplates) {
      pickupHeaders.push({
        label:
          maxPickupPoints > 1
            ? `${template.label} (${index + 1})`
            : template.label,
        background: colors.pickupColumn,
      });
    }
  }

  const dropoffHeaders = [];
  for (let index = 0; index < maxDropoffPoints; index += 1) {
    for (const template of dropoffColumnTemplates) {
      dropoffHeaders.push({
        label:
          maxDropoffPoints > 1
            ? `${template.label} (${index + 1})`
            : template.label,
        background: colors.dropoffColumn,
      });
    }
  }

  const totalColumns =
    1 +
    vehicleHeaders.length +
    pickupHeaders.length +
    dropoffHeaders.length +
    driverHeaders.length +
    bookingHeaders.length;

  const filterLinks = [
    { label: "All", value: "all" },
    { label: "Company", value: "company" },
    { label: "Rental", value: "rental" },
  ];

  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaCalendarDay size={26} />}
      headerSubtitle="แผนจัดรถประจำวัน"
      sidebarMode="overlay"
    >
      <div style={dashboardStyles.container}>
        <div style={dashboardStyles.card}>
          <div style={dashboardStyles.headerRow}>
            <div style={dashboardStyles.headerLeft}>
              <div style={dashboardStyles.headerTitle}>
                <FaClipboardList size={22} /> Daily Vehicle Booking Dashboard
              </div>
              <p style={dashboardStyles.headerSubtitle}>
                สรุปข้อมูลงานจองรถประจำวัน • {selectedDateLabel}
              </p>
            </div>
            <div style={dashboardStyles.statusControls}>
              <span style={dashboardStyles.statusLabel}>
                สถานะแผนการจัดรถประจำวัน
              </span>
              <DailyScheduleStatusControl
                scheduleDate={selectedDateStr}
                initialStatus={scheduleStatus.status}
                variantStyles={statusStylesByVariant}
              />
              <form method="get" style={dashboardStyles.dateForm}>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDateStr}
                  style={dashboardStyles.dateInput}
                />
                {filterType !== "all" ? (
                  <input type="hidden" name="type" value={filterType} />
                ) : null}
                <button type="submit" style={dashboardStyles.dateSubmit}>
                  <FaCalendarDay size={14} /> แสดง
                </button>
              </form>
              <div style={dashboardStyles.segmentControl}>
                {filterLinks.map((link) => (
                  <a
                    key={link.value}
                    href={buildFilterHref(selectedDateStr, link.value)}
                    style={dashboardStyles.segmentButton(filterType === link.value)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={dashboardStyles.actionRow}>
            <button
              type="button"
              style={dashboardStyles.actionButton("#1b7c3a")}
            >
              <FaFileExcel size={16} /> Export Excel
            </button>
            <button
              type="button"
              style={dashboardStyles.actionButton("#0b0c10")}
            >
              <FaCamera size={16} /> บันทึกภาพ
            </button>
          </div>

          <div style={dashboardStyles.tableWrapper}>
            <table style={dashboardStyles.table}>
              <thead>
                <tr>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerDate,
                      color: "#ffffff",
                    }}
                    rowSpan={2}
                  >
                    วันที่จอง
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerVehicle,
                      color: "#ffffff",
                    }}
                    colSpan={vehicleHeaders.length}
                  >
                    ข้อมูลรถ
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerTravel,
                      color: "#ffffff",
                    }}
                    colSpan={pickupHeaders.length}
                  >
                    ต้นทาง
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerTravel,
                      color: "#ffffff",
                    }}
                    colSpan={dropoffHeaders.length}
                  >
                    ปลายทาง
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerDriver,
                      color: "#ffffff",
                    }}
                    colSpan={driverHeaders.length}
                  >
                    ข้อมูลคนขับ
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerBooking,
                      color: "#ffffff",
                    }}
                    colSpan={bookingHeaders.length}
                  >
                    ข้อมูลคนจอง
                  </th>
                </tr>
                <tr>
                  {vehicleHeaders.map((cell, index) => (
                    <th
                      key={`vehicle-header-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                  {pickupHeaders.map((cell, index) => (
                    <th
                      key={`pickup-header-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                  {dropoffHeaders.map((cell, index) => (
                    <th
                      key={`dropoff-header-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                  {driverHeaders.map((cell, index) => (
                    <th
                      key={`driver-header-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                  {bookingHeaders.map((cell, index) => (
                    <th
                      key={`booking-header-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                        color: cell.color || colors.textDark,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td style={dashboardStyles.tableCell} colSpan={totalColumns}>
                      ยังไม่มีข้อมูลการจองสำหรับวันที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const pickupCells = [];
                    for (let index = 0; index < maxPickupPoints; index += 1) {
                      const point = booking.pickups[index];
                      pickupCells.push(
                        <td key={`pickup-time-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {point ? formatTimeValue(point.departTime) : "—"}
                        </td>,
                        <td key={`pickup-location-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {normalizeText(point?.locationName)}
                        </td>,
                        <td key={`pickup-detail-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {formatPointDetail(point)}
                        </td>,
                        <td key={`pickup-note-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {normalizeText(point?.note)}
                        </td>
                      );
                    }

                    const dropoffCells = [];
                    for (let index = 0; index < maxDropoffPoints; index += 1) {
                      const point = booking.dropoffs[index];
                      dropoffCells.push(
                        <td key={`dropoff-time-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {point ? formatTimeValue(point.arriveTime || point.departTime) : "—"}
                        </td>,
                        <td key={`dropoff-location-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {normalizeText(point?.locationName)}
                        </td>,
                        <td key={`dropoff-detail-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {formatPointDetail(point)}
                        </td>,
                        <td key={`dropoff-note-${booking.id}-${index}`} style={dashboardStyles.tableCell}>
                          {normalizeText(point?.note)}
                        </td>
                      );
                    }

                    return (
                      <tr key={`booking-row-${booking.id}`}>
                        <td style={dashboardStyles.tableCell}>{selectedDateLabel}</td>
                        <td style={dashboardStyles.tableCell}>
                          {normalizeText(
                            booking.vehicleType ||
                              (booking.bookingType === "rental" ? "รถเช่า" : "รถบริษัทฯ")
                          )}
                        </td>
                        <td style={dashboardStyles.tableCell}>
                          {normalizeText(
                            booking.vehicleName || booking.rentalCompany
                          )}
                        </td>
                        <td style={dashboardStyles.tableCell}>
                          {normalizeText(booking.vehicleRegistration)}
                        </td>
                        {pickupCells}
                        {dropoffCells}
                        <td style={dashboardStyles.tableCell}>
                          {normalizeText(booking.driverName)}
                        </td>
                        <td style={dashboardStyles.tableCell}>
                          {normalizeText(booking.driverPhone)}
                        </td>
                        <td style={dashboardStyles.tableCell}>{normalizeText(booking.requesterName)}</td>
                        <td style={dashboardStyles.tableCell}>{normalizeText(booking.departmentName)}</td>
                        <td style={dashboardStyles.tableCell}>{normalizeText(booking.factoryName)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
