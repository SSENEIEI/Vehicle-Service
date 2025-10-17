import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import {
  FaMagnifyingGlass,
  FaCalendarDays,
  FaPaperclip,
  FaTable,
  FaFileExcel,
} from "react-icons/fa6";
import { FaScrewdriverWrench } from "react-icons/fa6";

export const metadata = {
  title: "ติดตามงานซ่อม | Vehicle Service",
};

const colors = {
  primary: "#0c4aa1",
  surface: "#ffffff",
  border: "#d5dfee",
  accent: "#f4f7fc",
  textDark: "#1d2f4b",
  textMuted: "#5a6c8f",
  success: "#1f8243",
  warning: "#ffa726",
  pending: "#f7c948",
  urgent: "#e57373",
};

const layoutStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  headerCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "700",
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr repeat(4, 1fr)",
    gap: "16px",
  },
  filterField: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "10px 14px",
    backgroundColor: colors.surface,
    fontSize: "14px",
    color: colors.textMuted,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "16px",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: "18px",
    border: `1px solid ${colors.border}`,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  summaryLabel: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: colors.textDark,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: "20px",
    border: `1px solid ${colors.border}`,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  tableHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
  },
  exportButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#1b7c3a",
    color: "#ffffff",
    padding: "10px 16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeadCell: {
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    color: colors.textDark,
    padding: "12px 16px",
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.accent,
  },
  tableCell: {
    textAlign: "left",
    fontSize: "14px",
    color: colors.textDark,
    padding: "12px 16px",
    borderBottom: `1px solid ${colors.border}`,
  },
  badge: (background, color) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "76px",
    borderRadius: "999px",
    backgroundColor: background,
    color,
    fontSize: "13px",
    fontWeight: "700",
    padding: "6px 12px",
  }),
};

const repairSummary = [
  { label: "รายการซ่อมทั้งหมด", value: "40" },
  { label: "รออนุมัติ", value: "14" },
  { label: "รอซ่อม", value: "10" },
  { label: "ซ่อมเสร็จ", value: "16" },
  { label: "รวมค่าใช้จ่าย", value: "฿349,300" },
];

const repairRows = [
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    issue: "เปลี่ยนน้ำมันเครื่อง",
    status: { label: "รออนุมัติ", background: "#ffd0cb", color: "#d64545" },
    priority: { label: "เร่งด่วน", background: "#ffcdd2", color: "#c62828" },
    requester: "Prissana.K",
    center: "ลูกค้า",
    reportedDate: "01-10-2025",
    completedDate: "10-10-2025",
    duration: "10 วัน",
    cost: "3,500",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    issue: "เปลี่ยนน้ำมันเครื่อง",
    status: { label: "รอซ่อม", background: "#ffe9a9", color: "#8a6d1d" },
    priority: { label: "ปกติ", background: "#d5e8ff", color: "#0c4aa1" },
    requester: "Prissana.K",
    center: "ลูกค้า",
    reportedDate: "01-10-2025",
    completedDate: "10-10-2025",
    duration: "10 วัน",
    cost: "3,500",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    issue: "เปลี่ยนน้ำมันเครื่อง",
    status: { label: "ซ่อมเสร็จ", background: "#c7f1d4", color: "#1f8243" },
    priority: { label: "เร่งด่วน", background: "#ffcdd2", color: "#c62828" },
    requester: "Prissana.K",
    center: "ลูกค้า",
    reportedDate: "01-10-2025",
    completedDate: "10-10-2025",
    duration: "10 วัน",
    cost: "3,500",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    issue: "เปลี่ยนน้ำมันเครื่อง",
    status: { label: "ซ่อมเสร็จ", background: "#c7f1d4", color: "#1f8243" },
    priority: { label: "ปกติ", background: "#d5e8ff", color: "#0c4aa1" },
    requester: "Prissana.K",
    center: "ลูกค้า",
    reportedDate: "01-10-2025",
    completedDate: "10-10-2025",
    duration: "10 วัน",
    cost: "3,500",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    issue: "เปลี่ยนน้ำมันเครื่อง",
    status: { label: "รอซ่อม", background: "#ffe9a9", color: "#8a6d1d" },
    priority: { label: "ปกติ", background: "#d5e8ff", color: "#0c4aa1" },
    requester: "Prissana.K",
    center: "ลูกค้า",
    reportedDate: "01-10-2025",
    completedDate: "10-10-2025",
    duration: "10 วัน",
    cost: "3,500",
  },
];

export default function RepairTrackingPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ / ติดตามงานซ่อม"
    >
      <div style={layoutStyles.wrapper}>
        <div style={layoutStyles.headerCard}>
          <div style={layoutStyles.headerTitle}>
            <FaTable size={20} /> รายงานการติดตามแจ้งซ่อมรถบริษัทฯ
          </div>
          <p style={layoutStyles.headerSubtitle}>
            ติดตามสถานะงานซ่อม, การเคลมค่าใช้จ่าย และความคืบหน้าตามทะเบียนรถ
          </p>

          <div style={layoutStyles.filtersRow}>
            <div style={layoutStyles.filterField}>
              <FaMagnifyingGlass /> ค้นหา: เลขแจ้งซ่อม/ทะเบียนรถ/ผู้แจ้ง
            </div>
            <div style={layoutStyles.filterField}>
              <FaCalendarDays /> ตั้งแต่วันที่
            </div>
            <div style={layoutStyles.filterField}>
              <FaCalendarDays /> ถึงวันที่
            </div>
          </div>
        </div>

        <div style={layoutStyles.summaryRow}>
          {repairSummary.map((item) => (
            <div key={item.label} style={layoutStyles.summaryCard}>
              <span style={layoutStyles.summaryLabel}>{item.label}</span>
              <span style={layoutStyles.summaryValue}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={layoutStyles.tableCard}>
          <div style={layoutStyles.tableHeaderRow}>
            <div style={layoutStyles.tableTitle}>
              <FaPaperclip size={18} /> ตารางติดตามงานซ่อม
            </div>
            <button type="button" style={layoutStyles.exportButton}>
              <FaFileExcel /> Export Excel
            </button>
          </div>

          <table style={layoutStyles.table}>
            <thead>
              <tr>
                <th style={layoutStyles.tableHeadCell}>เลขแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>ทะเบียนรถ</th>
                <th style={layoutStyles.tableHeadCell}>ประเภทรถ</th>
                <th style={layoutStyles.tableHeadCell}>อาการ/ปัญหา</th>
                <th style={layoutStyles.tableHeadCell}>สถานะการซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>ลำดับความสำคัญ</th>
                <th style={layoutStyles.tableHeadCell}>ผู้แจ้ง</th>
                <th style={layoutStyles.tableHeadCell}>ศูนย์บริการ</th>
                <th style={layoutStyles.tableHeadCell}>วันแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>วันซ่อมเสร็จ</th>
                <th style={layoutStyles.tableHeadCell}>ระยะเวลาดำเนินการ</th>
                <th style={layoutStyles.tableHeadCell}>ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody>
              {repairRows.map((row, index) => (
                <tr key={`${row.code}-${index}`}>
                  <td style={layoutStyles.tableCell}>{row.code}</td>
                  <td style={layoutStyles.tableCell}>{row.plate}</td>
                  <td style={layoutStyles.tableCell}>{row.vehicleType}</td>
                  <td style={layoutStyles.tableCell}>{row.issue}</td>
                  <td style={layoutStyles.tableCell}>
                    <span style={layoutStyles.badge(row.status.background, row.status.color)}>
                      {row.status.label}
                    </span>
                  </td>
                  <td style={layoutStyles.tableCell}>
                    <span style={layoutStyles.badge(row.priority.background, row.priority.color)}>
                      {row.priority.label}
                    </span>
                  </td>
                  <td style={layoutStyles.tableCell}>{row.requester}</td>
                  <td style={layoutStyles.tableCell}>{row.center}</td>
                  <td style={layoutStyles.tableCell}>{row.reportedDate}</td>
                  <td style={layoutStyles.tableCell}>{row.completedDate}</td>
                  <td style={layoutStyles.tableCell}>{row.duration}</td>
                  <td style={layoutStyles.tableCell}>{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
