import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import {
  FaCalendarDay,
  FaCheck,
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
  statusComplete: "#1f8243",
  statusCompleteBg: "#d4f3e0",
  headerDate: "#0b1533",
  headerVehicle: "#2d9251",
  headerTravel: "#f29c38",
  headerDriver: "#1b6b36",
  headerBooking: "#182744",
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
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "18px",
    padding: "8px 18px",
    backgroundColor: colors.statusCompleteBg,
    color: colors.statusComplete,
    fontWeight: "700",
    fontSize: "14px",
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
  segmentControl: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: "999px",
    padding: "4px",
    border: `1px solid ${colors.border}`,
  },
  segmentButton: (active = false) => ({
    border: "none",
    borderRadius: "999px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    color: active ? "#ffffff" : colors.textDark,
    backgroundColor: active ? colors.headerBooking : "transparent",
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
  },
};

const secondaryHeaderCells = [
  { label: "ประเภทรถ", background: "#d9f0d8", color: colors.textDark },
  { label: "รถ", background: "#d9f0d8", color: colors.textDark },
  { label: "ทะเบียนรถ", background: "#d9f0d8", color: colors.textDark },
  { label: "เวลารถออก", background: "#ffe6c4", color: colors.textDark },
  { label: "จุดที่", background: "#ffe6c4", color: colors.textDark },
  { label: "รายละเอียด", background: "#ffe6c4", color: colors.textDark },
  { label: "หมายเหตุถึงคนขับ*ต้นทาง", background: "#ffe6c4", color: colors.textDark },
  { label: "เวลารถออก", background: "#ffd7a0", color: colors.textDark },
  { label: "จุดที่", background: "#ffd7a0", color: colors.textDark },
  { label: "รายละเอียด", background: "#ffd7a0", color: colors.textDark },
  { label: "หมายเหตุถึงคนขับ*ปลายทาง", background: "#ffd7a0", color: colors.textDark },
  { label: "ชื่อคนขับ", background: "#cae9bd", color: colors.textDark },
  { label: "เบอร์โทร", background: "#cae9bd", color: colors.textDark },
  { label: "คนจอง", background: colors.headerBooking, color: "#ffffff" },
  { label: "แผนก", background: colors.headerBooking, color: "#ffffff" },
  { label: "โรงงาน", background: colors.headerBooking, color: "#ffffff" },
];

const blankRows = Array.from({ length: 7 }, (_, index) => index);

export default function DailySchedulePage() {
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
              <p style={dashboardStyles.headerSubtitle}>สรุปข้อมูลงานจองรถประจำวัน</p>
            </div>
            <div style={dashboardStyles.statusControls}>
              <span style={dashboardStyles.statusLabel}>สถานะแผนการจัดรถประจำวัน</span>
              <span style={dashboardStyles.statusBadge}>
                <FaCheck size={12} /> Complete
              </span>
              <input
                type="date"
                defaultValue="2025-10-02"
                style={dashboardStyles.dateInput}
              />
              <div style={dashboardStyles.segmentControl}>
                <button type="button" style={dashboardStyles.segmentButton(true)}>
                  All
                </button>
                <button type="button" style={dashboardStyles.segmentButton(false)}>
                  Company
                </button>
                <button type="button" style={dashboardStyles.segmentButton(false)}>
                  Rental
                </button>
              </div>
            </div>
          </div>

          <div style={dashboardStyles.actionRow}>
            <button type="button" style={dashboardStyles.actionButton("#1b7c3a")}> 
              <FaFileExcel size={16} /> Export Excel
            </button>
            <button type="button" style={dashboardStyles.actionButton("#0b0c10")}> 
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
                    colSpan={3}
                  >
                    ข้อมูลรถ
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerTravel,
                      color: "#ffffff",
                    }}
                    colSpan={4}
                  >
                    ต้นทาง
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerTravel,
                      color: "#ffffff",
                    }}
                    colSpan={4}
                  >
                    ปลายทาง
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerDriver,
                      color: "#ffffff",
                    }}
                    colSpan={2}
                  >
                    ข้อมูลคนขับ
                  </th>
                  <th
                    style={{
                      ...dashboardStyles.tableHeadCell,
                      backgroundColor: colors.headerBooking,
                      color: "#ffffff",
                    }}
                    colSpan={3}
                  >
                    ข้อมูลคนจอง
                  </th>
                </tr>
                <tr>
                  {secondaryHeaderCells.map((cell, index) => (
                    <th
                      key={`${cell.label}-${index}`}
                      style={{
                        ...dashboardStyles.tableHeadCell,
                        backgroundColor: cell.background,
                        color: cell.color,
                      }}
                    >
                      {cell.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blankRows.map((rowKey) => (
                  <tr key={`booking-row-${rowKey}`}>
                    {Array.from({ length: 17 }, (_, columnIndex) => (
                      <td key={`booking-cell-${rowKey}-${columnIndex}`} style={dashboardStyles.tableCell}>
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
