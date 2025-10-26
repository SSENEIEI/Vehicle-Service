import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { initDatabase, query } from "@/lib/db";
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
	tagCompany: "#f8f1d5",
	tagRental: "#f0f5d5",
	tagRemaining: "#f6ebd5",
	tableHeader: "#ebf1fb",
};

const STATUS_LABELS = {
	approved: "อนุมัติ",
	pending: "รออนุมัติ",
	rejected: "ไม่อนุมัติ",
	cancelled: "ยกเลิก",
};

const STATUS_BADGE_THEME = {
	approved: { background: "#dbf5e4", color: "#1b7a3e" },
	pending: { background: "#fff7d6", color: "#ad7a16" },
	rejected: { background: "#ffe2e0", color: "#c33333" },
	cancelled: { background: "#e5e7eb", color: "#4b5563" },
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
	linkButton: {
		textDecoration: "none",
		color: colors.textDark,
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
		gap: "12px",
		backgroundColor: colors.accent,
		border: `1px solid ${colors.border}`,
		borderRadius: "18px",
		padding: "16px",
		alignItems: "stretch",
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
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
		width: "100%",
	},
	tagValueRow: {
		display: "grid",
		gridTemplateColumns: "1fr auto",
		alignItems: "center",
		gap: "12px",
		width: "100%",
	},
	tagLabel: {
		color: colors.textMuted,
		fontWeight: "600",
	},
	tagValuePill: (backgroundColor) => ({
		backgroundColor,
		borderRadius: "8px",
		padding: "4px 14px",
		minWidth: "48px",
		textAlign: "center",
		fontWeight: "700",
		color: colors.textDark,
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
	statusBadge: (statusKey) => {
		const theme = STATUS_BADGE_THEME[statusKey] || STATUS_BADGE_THEME.pending;
		return {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "6px 14px",
			borderRadius: "999px",
			backgroundColor: theme.background,
			color: theme.color,
			fontWeight: "700",
			fontSize: "13px",
			minWidth: "104px",
		};
	},
};

const weekdayLabels = [
	"จันทร์",
	"อังคาร",
	"พุธ",
	"พฤหัสบดี",
	"ศุกร์",
	"เสาร์",
	"อาทิตย์",
];

const numberFormatter = new Intl.NumberFormat("th-TH");
const currencyFormatter = new Intl.NumberFormat("th-TH", {
	style: "currency",
	currency: "THB",
});

function formatThaiDate(value) {
	if (!value) {
		return "-";
	}
	try {
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			return "-";
		}
		return new Intl.DateTimeFormat("th-TH", {
			day: "numeric",
			month: "numeric",
			year: "numeric",
		}).format(date);
	} catch {
		return "-";
	}
}

function formatTime(value) {
	if (!value) {
		return "";
	}
	const str = typeof value === "string" ? value : String(value);
	if (!str.includes(":")) {
		return str;
	}
	const [hours, minutes] = str.split(":");
	return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function formatTimeRange(start, end) {
	const startLabel = formatTime(start);
	const endLabel = formatTime(end);
	if (startLabel && endLabel) {
		return `${startLabel} - ${endLabel}`;
	}
	return startLabel || endLabel || "-";
}

function buildMonthLinks(monthIndex, year) {
	const prevDate = new Date(year, monthIndex - 1, 1);
	const nextDate = new Date(year, monthIndex + 1, 1);
	const formatLink = (date) => `?month=${date.getMonth() + 1}&year=${date.getFullYear()}`;
	return {
		prevHref: formatLink(prevDate),
		nextHref: formatLink(nextDate),
		monthName: new Intl.DateTimeFormat("th-TH", { month: "long" }).format(
			new Date(year, monthIndex, 1)
		),
		yearDisplay: year + 543,
	};
}

async function fetchMonthlyBookings(startDate, endDate) {
	return query(
		`SELECT b.id,
				b.booking_type AS bookingType,
				b.ga_status AS gaStatus,
				b.rental_cost AS rentalCost,
				b.ga_vehicle_type AS gaVehicleType,
				b.ga_driver_name AS gaDriverName,
				b.ga_driver_phone AS gaDriverPhone,
				b.reference_code AS referenceCode,
				b.requester_name AS requesterName,
				b.requester_emp_no AS requesterEmpNo,
				b.contact_phone AS contactPhone,
				b.contact_email AS contactEmail,
				pickup.travel_date AS travelDate,
				pickup.depart_time AS departTime,
				pickup.location_province AS pickupProvince,
				dropoff.arrive_time AS arriveTime,
				dropoff.location_province AS dropoffProvince,
				factories.name AS factoryName,
				divisions.name AS divisionName,
				departments.name AS departmentName
		FROM bookings b
		JOIN (
			SELECT bp.booking_id,
					MIN(bp.travel_date) AS travel_date,
					MIN(bp.depart_time) AS depart_time,
					SUBSTRING_INDEX(
						GROUP_CONCAT(bp.province ORDER BY bp.travel_date, bp.sequence_no SEPARATOR '||'),
						'||',
						1
					) AS location_province
			FROM booking_points bp
			WHERE bp.point_type = 'pickup'
			GROUP BY bp.booking_id
		) pickup ON pickup.booking_id = b.id
		LEFT JOIN (
			SELECT bp.booking_id,
					MAX(bp.arrive_time) AS arrive_time,
					SUBSTRING_INDEX(
						GROUP_CONCAT(bp.province ORDER BY bp.travel_date DESC, bp.sequence_no DESC SEPARATOR '||'),
						'||',
						1
					) AS location_province
			FROM booking_points bp
			WHERE bp.point_type = 'dropoff'
			GROUP BY bp.booking_id
		) dropoff ON dropoff.booking_id = b.id
		LEFT JOIN factories ON factories.id = b.factory_id
		LEFT JOIN divisions ON divisions.id = b.division_id
		LEFT JOIN departments ON departments.id = b.department_id
		WHERE pickup.travel_date BETWEEN ? AND ?
		ORDER BY pickup.travel_date ASC, pickup.depart_time ASC, b.id ASC`,
		[startDate, endDate]
	);
}

async function fetchVehicleCapacity() {
	const [row] = await query(
		"SELECT COUNT(*) AS totalVehicles FROM company_vehicles"
	);
	return Number(row?.totalVehicles || 0);
}

export default async function OverallPlanPage({ searchParams }) {
	const now = new Date();
	const monthParam = Number.parseInt(searchParams?.month, 10);
	const yearParam = Number.parseInt(searchParams?.year, 10);
	const targetMonthIndex = Number.isInteger(monthParam)
		? Math.min(Math.max(monthParam - 1, 0), 11)
		: now.getMonth();
	const targetYear = Number.isInteger(yearParam) ? yearParam : now.getFullYear();
	const startDate = new Date(targetYear, targetMonthIndex, 1);
	const endDate = new Date(targetYear, targetMonthIndex + 1, 0);
	const startDateStr = `${startDate.getFullYear()}-${String(targetMonthIndex + 1).padStart(2, "0")}-01`;
	const endDateStr = `${endDate.getFullYear()}-${String(targetMonthIndex + 1).padStart(2, "0")}-${String(
		endDate.getDate()
	).padStart(2, "0")}`;

	await initDatabase();
	const [monthlyBookings, totalVehicles] = await Promise.all([
		fetchMonthlyBookings(startDateStr, endDateStr),
		fetchVehicleCapacity(),
	]);

	const summary = {
		total: 0,
		company: 0,
		rental: 0,
		rentalCost: 0,
	};
	const dailyMap = new Map();

	for (const booking of monthlyBookings) {
		const travelDate = booking.travelDate
			? new Date(booking.travelDate)
			: null;
		const isValidDate = travelDate && !Number.isNaN(travelDate.getTime());
		summary.total += 1;
		if (booking.bookingType === "company") {
			summary.company += 1;
		} else if (booking.bookingType === "rental") {
			summary.rental += 1;
			if (booking.rentalCost !== null && booking.rentalCost !== undefined) {
				summary.rentalCost += Number(booking.rentalCost) || 0;
			}
		}
		if (!isValidDate) {
			continue;
		}
		const dateKey = `${travelDate.getFullYear()}-${String(
			travelDate.getMonth() + 1
		).padStart(2, "0")}-${String(travelDate.getDate()).padStart(2, "0")}`;
		if (!dailyMap.has(dateKey)) {
			dailyMap.set(dateKey, { company: 0, rental: 0 });
		}
		const entry = dailyMap.get(dateKey);
		if (booking.bookingType === "company") {
			entry.company += 1;
		} else if (booking.bookingType === "rental") {
			entry.rental += 1;
		}
	}

	const daysInMonth = endDate.getDate();
	const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
		const day = index + 1;
		const key = `${targetYear}-${String(targetMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const counts = dailyMap.get(key) || { company: 0, rental: 0 };
		const remaining = totalVehicles
			? Math.max(totalVehicles - counts.company, 0)
			: null;
		return {
			day,
			company: counts.company,
			rental: counts.rental,
			remaining,
		};
	});

	const tableRows = monthlyBookings.map((booking) => {
		const travelDate = booking.travelDate
			? new Date(booking.travelDate)
			: null;
		const statusKey = booking.gaStatus || "pending";
		return {
			date: formatThaiDate(travelDate),
			time: formatTimeRange(booking.departTime, booking.arriveTime),
			type: booking.bookingType === "company" ? "Company" : "Rental",
			province: booking.dropoffProvince || booking.pickupProvince || "-",
			department: booking.departmentName || "-",
			plant: booking.factoryName || "-",
			statusKey,
			statusLabel: STATUS_LABELS[statusKey] || STATUS_LABELS.pending,
			cost:
				booking.bookingType === "rental" && booking.rentalCost !== null
					? currencyFormatter.format(Number(booking.rentalCost))
					: "—",
		};
	});

	const monthContext = buildMonthLinks(targetMonthIndex, targetYear);
	const monthLabelWithYear = new Intl.DateTimeFormat("th-TH", {
		month: "long",
		year: "numeric",
	}).format(new Date(targetYear, targetMonthIndex, 1));

	const summaryCards = [
		{
			label: "Total Bookings",
			value: numberFormatter.format(summary.total),
			note: `รวมทั้งหมดในเดือน${monthContext.monthName}`,
		},
		{
			label: "Company",
			value: numberFormatter.format(summary.company),
			note: "จำนวนจองรถบริษัทฯ",
		},
		{
			label: "Rental",
			value: numberFormatter.format(summary.rental),
			note: "จำนวนจองรถเช่า",
		},
		{
			label: "Cost (Rental)",
			value: currencyFormatter.format(summary.rentalCost),
			note: "รวมค่าใช้จ่ายรถเช่า",
		},
	];

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
							<a href={monthContext.prevHref} style={{ ...styles.arrowButton, ...styles.linkButton }}>
								<FaChevronLeft size={18} />
							</a>
							<span style={styles.pillButton}>{monthContext.monthName}</span>
							<a href={monthContext.nextHref} style={{ ...styles.arrowButton, ...styles.linkButton }}>
								<FaChevronRight size={18} />
							</a>
							<span style={styles.pillButton}>{monthContext.yearDisplay}</span>
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
								<div key={`day-${day.day}`} style={styles.dayCard}>
									<span style={styles.dayNumber}>{day.day}</span>
									<div style={styles.tagRow}>
											<div style={styles.tagValueRow}>
												<span style={styles.tagLabel}>Company</span>
												<span style={styles.tagValuePill(colors.tagCompany)}>
													{numberFormatter.format(day.company)}
												</span>
										</div>
											<div style={styles.tagValueRow}>
												<span style={styles.tagLabel}>Rental</span>
												<span style={styles.tagValuePill(colors.tagRental)}>
													{numberFormatter.format(day.rental)}
												</span>
										</div>
											<div style={styles.tagValueRow}>
												<span style={styles.tagLabel}>Company Remaining</span>
												<span style={styles.tagValuePill(colors.tagRemaining)}>
													{day.remaining === null
														? "—"
														: numberFormatter.format(day.remaining)}
												</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section style={styles.tableCard}>
					<div style={styles.tableHeaderRow}>
						<h3 style={styles.tableTitle}>รายการทั้งหมดเดือน {monthLabelWithYear}</h3>
						<span style={styles.pillButton}>{monthContext.monthName}</span>
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
							{tableRows.length === 0 ? (
								<tr>
									<td style={styles.tableCell} colSpan={8}>
										ยังไม่มีข้อมูลการจองในเดือนนี้
									</td>
								</tr>
							) : (
								tableRows.map((row, index) => (
									<tr key={`booking-row-${index}`}>
										<td style={styles.tableCell}>{row.date}</td>
										<td style={styles.tableCell}>{row.time}</td>
										<td style={styles.tableCell}>{row.type}</td>
										<td style={styles.tableCell}>{row.province}</td>
										<td style={styles.tableCell}>{row.department}</td>
										<td style={styles.tableCell}>{row.plant}</td>
										<td style={styles.tableCell}>
											<span style={styles.statusBadge(row.statusKey)}>{row.statusLabel}</span>
										</td>
										<td style={styles.tableCell}>{row.cost}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</section>
			</div>
		</DashboardShell>
	);
}
