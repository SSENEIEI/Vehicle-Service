import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import {
  FaMagnifyingGlass,
  FaCalendarDays,
  FaGavel,
  FaListCheck,
  FaPaperclip,
} from "react-icons/fa6";
import { FaScrewdriverWrench } from "react-icons/fa6";

export const metadata = {
  title: "ประมูลซ่อมรถ | Vehicle Service",
};

const colors = {
  primary: "#0c4aa1",
  surface: "#ffffff",
  border: "#d5dfee",
  accent: "#f4f7fc",
  textDark: "#1d2f4b",
  textMuted: "#5a6c8f",
  badgeOpen: "#c8efd7",
  badgeOpenText: "#1f8243",
  badgeClosed: "#ffd6d6",
  badgeClosedText: "#d64545",
  badgeOnProcess: "#ffe8ac",
  badgeOnProcessText: "#8a6d1d",
  badgeNotStarted: "#ffcbd2",
  badgeNotStartedText: "#c62828",
  badgeCompleted: "#c7f1d4",
  badgeCompletedText: "#1f8243",
};

const layoutStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  headerCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
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
    gridTemplateColumns: "1.5fr 0.8fr repeat(2, 1fr)",
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
  dropdownIndicator: {
    marginLeft: "auto",
    fontWeight: "700",
    color: colors.textDark,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
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
  statusBadge: (background, color) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "72px",
    borderRadius: "999px",
    backgroundColor: background,
    color,
    fontSize: "13px",
    fontWeight: "700",
    padding: "6px 12px",
  }),
  rowActions: {
    display: "flex",
    gap: "10px",
  },
  detailButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    border: `1.5px solid ${colors.textDark}`,
    backgroundColor: colors.surface,
    color: colors.textDark,
    fontWeight: "700",
    padding: "8px 16px",
    cursor: "pointer",
  },
  bidButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#0b1533",
    color: "#ffffff",
    fontWeight: "700",
    padding: "8px 18px",
    cursor: "pointer",
  },
  vendorSearchRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  vendorSearchInput: {
    flex: "1 1 280px",
    height: "42px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "0 14px",
    fontSize: "15px",
    color: colors.textMuted,
    backgroundColor: colors.surface,
  },
  vendorSearchButton: {
    borderRadius: "16px",
    border: "none",
    backgroundColor: "#0b1533",
    color: "#ffffff",
    fontWeight: "700",
    padding: "10px 22px",
    cursor: "pointer",
  },
};

const auctionRows = [
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    status: "Open",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    status: "Open",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    status: "Closed",
  },
];

const claimRows = [
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    completedDate: "01-10-2025",
    vendor: "xx",
    status: "On Process",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    completedDate: "01-10-2025",
    vendor: "xx",
    status: "Not Started",
  },
  {
    code: "R-0012",
    plate: "5dm-778",
    vehicleType: "Sedan",
    description: "เปลี่ยนน้ำมันเครื่อง",
    notifiedDate: "01-10-2025",
    completedDate: "01-10-2025",
    vendor: "xx",
    status: "Completed",
  },
];

function renderAuctionStatus(status) {
  if (status === "Closed") {
    return layoutStyles.statusBadge(colors.badgeClosed, colors.badgeClosedText);
  }
  return layoutStyles.statusBadge(colors.badgeOpen, colors.badgeOpenText);
}

function renderClaimStatus(status) {
  if (status === "Completed") {
    return layoutStyles.statusBadge(colors.badgeCompleted, colors.badgeCompletedText);
  }
  if (status === "On Process") {
    return layoutStyles.statusBadge(colors.badgeOnProcess, colors.badgeOnProcessText);
  }
  return layoutStyles.statusBadge(colors.badgeNotStarted, colors.badgeNotStartedText);
}

export default function RepairBiddingPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ / ประมูลซ่อมรถ"
    >
      <div style={layoutStyles.wrapper}>
        <div style={layoutStyles.headerCard}>
          <div style={layoutStyles.headerTitle}>
            <FaGavel size={20} /> ระบบประมูลงานซ่อมรถสำหรับผู้ให้บริการ (Vendor)
          </div>
          <p style={layoutStyles.headerSubtitle}>
            เชื่อมโยงข้อมูลจากแบบฟอร์มแจ้งซ่อม (แอดมิน)
          </p>

          <div style={layoutStyles.filtersRow}>
            <div style={layoutStyles.filterField}>
              <FaMagnifyingGlass /> ค้นหา: เลขแจ้งซ่อม/ทะเบียนรถ
            </div>
            <div style={layoutStyles.filterField}>
              ทั้งหมด
              <span style={layoutStyles.dropdownIndicator}>▼</span>
            </div>
            <div style={layoutStyles.filterField}>
              <FaCalendarDays /> ตั้งแต่วันที่
            </div>
            <div style={layoutStyles.filterField}>
              <FaCalendarDays /> ถึงวันที่
            </div>
          </div>
        </div>

        <div style={layoutStyles.sectionCard}>
          <div style={layoutStyles.sectionHeader}>
            <FaListCheck size={18} /> รายการประมูลงานซ่อม
          </div>

          <table style={layoutStyles.table}>
            <thead>
              <tr>
                <th style={layoutStyles.tableHeadCell}>เลขแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>ทะเบียนรถ</th>
                <th style={layoutStyles.tableHeadCell}>ประเภทรถ</th>
                <th style={layoutStyles.tableHeadCell}>รายการแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>แจ้งเมื่อ</th>
                <th style={layoutStyles.tableHeadCell}>สถานะประมูล</th>
                <th style={layoutStyles.tableHeadCell}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {auctionRows.map((row, index) => (
                <tr key={`${row.code}-${index}`}>
                  <td style={layoutStyles.tableCell}>{row.code}</td>
                  <td style={layoutStyles.tableCell}>{row.plate}</td>
                  <td style={layoutStyles.tableCell}>{row.vehicleType}</td>
                  <td style={layoutStyles.tableCell}>{row.description}</td>
                  <td style={layoutStyles.tableCell}>{row.notifiedDate}</td>
                  <td style={layoutStyles.tableCell}>
                    <span style={renderAuctionStatus(row.status)}>{row.status}</span>
                  </td>
                  <td style={layoutStyles.tableCell}>
                    <div style={layoutStyles.rowActions}>
                      <button type="button" style={layoutStyles.detailButton}>
                        รายละเอียด
                      </button>
                      <button type="button" style={layoutStyles.bidButton}>
                        เสนอราคา
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={layoutStyles.sectionCard}>
          <div style={layoutStyles.sectionHeader}>
            <FaPaperclip size={16} /> ตรวจสอบสถานะเคลมค่าใช้จ่าย
          </div>
          <p style={{ ...layoutStyles.headerSubtitle, marginTop: "-4px" }}>
            ค้นหาได้เฉพาะรายการที่เป็น Vendor ของ User นี้เท่านั้น
          </p>

          <div style={layoutStyles.vendorSearchRow}>
            <input
              style={layoutStyles.vendorSearchInput}
              placeholder="เลขแจ้งซ่อม / Vendor name"
            />
            <button type="button" style={layoutStyles.vendorSearchButton}>
              ค้นหา
            </button>
          </div>

          <table style={layoutStyles.table}>
            <thead>
              <tr>
                <th style={layoutStyles.tableHeadCell}>เลขแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>ทะเบียนรถ</th>
                <th style={layoutStyles.tableHeadCell}>ประเภทรถ</th>
                <th style={layoutStyles.tableHeadCell}>รายการแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>แจ้งเมื่อ</th>
                <th style={layoutStyles.tableHeadCell}>ซ่อมเสร็จเมื่อ</th>
                <th style={layoutStyles.tableHeadCell}>ผู้ให้บริการ</th>
                <th style={layoutStyles.tableHeadCell}>สถานะเคลม</th>
              </tr>
            </thead>
            <tbody>
              {claimRows.map((row, index) => (
                <tr key={`${row.code}-claim-${index}`}>
                  <td style={layoutStyles.tableCell}>{row.code}</td>
                  <td style={layoutStyles.tableCell}>{row.plate}</td>
                  <td style={layoutStyles.tableCell}>{row.vehicleType}</td>
                  <td style={layoutStyles.tableCell}>{row.description}</td>
                  <td style={layoutStyles.tableCell}>{row.notifiedDate}</td>
                  <td style={layoutStyles.tableCell}>{row.completedDate}</td>
                  <td style={layoutStyles.tableCell}>{row.vendor}</td>
                  <td style={layoutStyles.tableCell}>
                    <span style={renderClaimStatus(row.status)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
