import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import {
	FaClipboardList,
	FaChevronLeft,
	FaChevronRight,
} from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";

export const metadata = {
	title: "แผนการใช้รถภาพรวม | Vehicle Service",
};

const colors = {
	background: "#eef1f6",
	surface: "#f9fafc",
	border: "#d8dde9",
	textDark: "#1c2738",
	textMuted: "#6c7484",
	accent: "#ffffff",
	tagCompany: "#000",
	tagRental: "#000",
	tagRemaining: "#000",
	tableHeader: "#ebf1fb",
};

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "26px",
	},
	dashboardCard: {
		display: "flex",
		flexDirection: "column",
		gap: "24px",
		padding: "26px",
		backgroundColor: colors.surface,
		borderRadius: "24px",
		border: `1px solid ${colors.border}`,
	},
	headerRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "18px",
	},
	headerTitle: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		fontSize: "24px",
		fontWeight: "800",
		color: colors.textDark,
	},
	headerSubtitle: {
		fontSize: "16px",
		color: colors.textMuted,
	},
	summaryRow: {
		display: "grid",
		gap: "18px",
		gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
	},
	summaryCard: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		gap: "14px",
		backgroundColor: colors.accent,
		borderRadius: "18px",
		border: `1px solid ${colors.border}`,
		padding: "18px 20px",
	},
	summaryLabel: {
		fontSize: "20px",
		fontWeight: "700",
		color: colors.textDark,
	},
	summaryValue: {
		fontSize: "36px",
		fontWeight: "800",
		color: colors.textDark,
	},
	summaryNote: {
		fontSize: "14px",
		color: colors.textMuted,
	},
	monthControls: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		flexWrap: "wrap",
	},
	pillButton: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: "14px",
		padding: "10px 18px",
		border: `1px solid ${colors.border}`,
		backgroundColor: colors.accent,
		fontWeight: "700",
		color: colors.textDark,
		cursor: "pointer",
	},
	arrowButton: {
		width: "42px",
		height: "42px",
		borderRadius: "14px",
		border: `1px solid ${colors.border}`,
		backgroundColor: colors.accent,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
	},
	calendarWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
	},
	weekHeader: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(140px, 1fr))",
		gap: "12px",
		color: colors.textMuted,
		fontWeight: "700",
		fontSize: "16px",
			textAlign: "center",
	},
	calendarGrid: {
			display: "grid",
			gridTemplateColumns: "repeat(7, minmax(140px, 1fr))",
			gap: "14px",
			justifyItems: "stretch",
	},
	dayCard: {
		display: "flex",
		flexDirection: "column",
			gap: "14px",
		backgroundColor: colors.accent,
		border: `1px solid ${colors.border}`,
		borderRadius: "18px",
		padding: "16px",
			alignItems: "center",
	},
	dayNumber: {
			fontSize: "22px",
			fontWeight: "700",
			color: colors.textDark,
			textAlign: "center",
	},
	tagRow: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		fontSize: "12px",
		color: colors.textDark,
	},
	tagValueRow: (color) => ({
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#f7f4e3",
		borderRadius: "10px",
		padding: "6px 10px",
		color,
		fontWeight: "700",
	}),
	tableCard: {
		backgroundColor: colors.accent,
		borderRadius: "22px",
		border: `1px solid ${colors.border}`,
		padding: "24px",
		display: "flex",
		flexDirection: "column",
		gap: "18px",
	},
	tableHeaderRow: {
		display: "flex",
		alignItems: "center",
		gap: "14px",
		flexWrap: "wrap",
	},
	tableTitle: {
		fontSize: "18px",
		fontWeight: "700",
		color: colors.textDark,
	},
	tableControls: {
		marginLeft: "auto",
		display: "flex",
		gap: "10px",
	},
	exportButton: {
		borderRadius: "16px",
		border: "none",
		padding: "10px 20px",
		backgroundColor: "#1f8243",
		color: "#ffffff",
		fontWeight: "700",
		cursor: "pointer",
	},
	table: {
		width: "100%",
		borderCollapse: "collapse",
	},
	tableHeadCell: {
		backgroundColor: colors.tableHeader,
		padding: "14px",
		fontSize: "14px",
		color: colors.textDark,
		fontWeight: "700",
		textAlign: "left",
		borderBottom: `1px solid ${colors.border}`,
	},
	tableCell: {
		padding: "14px",
		fontSize: "14px",
		color: colors.textDark,
		borderBottom: `1px solid ${colors.border}`,
	},
	statusBadge: (status) => {
		const palette = {
			Approved: { background: "#dbf5e4", color: "#1b7a3e" },
			Pending: { background: "#fff7d6", color: "#ad7a16" },
			"Not Approved": { background: "#ffe2e0", color: "#c33333" },
		};

		const choice = palette[status] || palette.Pending;

		return {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "6px 14px",
			borderRadius: "999px",
			backgroundColor: choice.background,
			color: choice.color,
			fontWeight: "700",
			fontSize: "13px",
			minWidth: "104px",
		};
	},
};

const summaryCards = [
	{ label: "Total Bookings", value: "9", note: "รวมทั้งหมดในเดือนนี้" },
	{ label: "Company", value: "9", note: "จำนวนจองรถบริษัทฯ" },
	{ label: "Rental", value: "9", note: "จำนวนจองรถเช่า" },
	{ label: "Cost (Rental)", value: "฿9,300", note: "รวมค่าใช้จ่ายรถเช่า" },
];

const weekdayLabels = [
	"จันทร์",
	"อังคาร",
	"พุธ",
	"พฤหัสบดี",
	"ศุกร์",
	"เสาร์",
	"อาทิตย์",
];

const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);

const tableRows = [
	{
		date: "1-10-2025",
		time: "09:00-15:00",
		type: "Company",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Approved",
		cost: "1,500",
	},
	{
		date: "2-10-2025",
		time: "09:00-15:00",
		type: "Rental",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Pending",
		cost: "1,500",
	},
	{
		date: "3-10-2025",
		time: "09:00-15:00",
		type: "Company",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Not Approved",
		cost: "1,500",
	},
	{
		date: "4-10-2025",
		time: "09:00-15:00",
		type: "Rental",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Not Approved",
		cost: "1,500",
	},
	{
		date: "5-10-2025",
		time: "09:00-15:00",
		type: "Rental",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Pending",
		cost: "1,500",
	},
	{
		date: "6-10-2025",
		time: "09:00-15:00",
		type: "Company",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Approved",
		cost: "1,500",
	},
	{
		date: "7-10-2025",
		time: "09:00-15:00",
		type: "Company",
		province: "กรุงเทพฯ",
		department: "GA",
		plant: "AC",
		status: "Approved",
		cost: "1,500",
	},
];

export default function OverallPlanPage() {
	return (
		<DashboardShell
			menuItems={menuItems}
			headerIcon={<FaClipboardList size={26} />}
			headerSubtitle="แผนการใช้รถภาพรวม"
		>
			<div style={styles.container}>
				<section style={styles.dashboardCard}>
					<div style={styles.headerRow}>
						<div>
							<div style={styles.headerTitle}>
								<FaCalendarAlt size={26} /> Monthly Vehicle Booking Dashboard
							</div>
							<p style={styles.headerSubtitle}>
								รวมการจองทั้งเดือน (รถบริษัทฯ + รถเช่า)
							</p>
						</div>
						<div style={styles.monthControls}>
							<button type="button" style={styles.arrowButton}>
								<FaChevronLeft size={18} />
							</button>
							<button type="button" style={styles.pillButton}>ตุลาคม</button>
							<button type="button" style={styles.arrowButton}>
								<FaChevronRight size={18} />
							</button>
							<button type="button" style={styles.pillButton}>2025</button>
						</div>
					</div>

					<div style={styles.summaryRow}>
						{summaryCards.map((card) => (
							<div key={card.label} style={styles.summaryCard}>
								<p style={styles.summaryLabel}>{card.label}</p>
								<span style={styles.summaryValue}>{card.value}</span>
								<span style={styles.summaryNote}>{card.note}</span>
							</div>
						))}
					</div>

					<div style={styles.calendarWrapper}>
						<div style={styles.weekHeader}>
							{weekdayLabels.map((weekday) => (
								<span key={weekday}>{weekday}</span>
							))}
						</div>
						<div style={styles.calendarGrid}>
							{calendarDays.map((day) => (
								<div key={`day-${day}`} style={styles.dayCard}>
									<span style={styles.dayNumber}>{day}</span>
									<div style={styles.tagRow}>
										<div style={styles.tagValueRow(colors.tagCompany)}>
											<span>Company</span>
											<span>—</span>
										</div>
										<div style={styles.tagValueRow(colors.tagRental)}>
											<span>Rental</span>
											<span>—</span>
										</div>
										<div style={styles.tagValueRow(colors.tagRemaining)}>
											<span>Company Remaining</span>
											<span>—</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section style={styles.tableCard}>
					<div style={styles.tableHeaderRow}>
						<h3 style={styles.tableTitle}>รายการทั้งหมดเดือน</h3>
						<button type="button" style={styles.pillButton}>ตุลาคม</button>
						<div style={styles.tableControls}>
							<button type="button" style={styles.exportButton}>Export Excel</button>
						</div>
					</div>

					<table style={styles.table}>
						<thead>
							<tr>
								{[
									"วันที่",
									"เวลา",
									"ประเภท",
									"จังหวัดปลายทาง",
									"แผนก",
									"โรงงาน",
									"สถานะ",
									"ค่าใช้จ่าย",
								].map((header) => (
									<th key={header} style={styles.tableHeadCell}>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{tableRows.map((row, index) => (
								<tr key={`booking-row-${index}`}>
									<td style={styles.tableCell}>{row.date}</td>
									<td style={styles.tableCell}>{row.time}</td>
									<td style={styles.tableCell}>{row.type}</td>
									<td style={styles.tableCell}>{row.province}</td>
									<td style={styles.tableCell}>{row.department}</td>
									<td style={styles.tableCell}>{row.plant}</td>
									<td style={styles.tableCell}>
										<span style={styles.statusBadge(row.status)}>{row.status}</span>
									</td>
									<td style={styles.tableCell}>{row.cost}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</div>
		</DashboardShell>
	);
}
