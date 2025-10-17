import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaUsers, FaCarSide } from "react-icons/fa6";
import { FaUserTie, FaCalendarAlt } from "react-icons/fa";

export const metadata = {
  title: "รถและพนักงานบริษัทฯ | Vehicle Service",
};

const colors = {
  background: "#eef0f5",
  surface: "#ffffff",
  border: "#d1d8e5",
  textDark: "#1d2939",
  textMuted: "#687082",
  accent: "#fcfcfe",
  statusAvailable: "#2f9151",
  statusBusy: "#d64545",
  sectionDivider: "#c7cfdd",
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: colors.textDark,
  },
  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "26px",
    fontWeight: "800",
  },
  pageSubtitle: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  dateBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: colors.surface,
    borderRadius: "14px",
    border: `1px solid ${colors.border}`,
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
  },
  sectionBlock: {
    backgroundColor: colors.surface,
    borderRadius: "22px",
    border: `1px solid ${colors.border}`,
    padding: "22px 26px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "20px",
    fontWeight: "800",
    color: colors.textDark,
  },
  cardGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  vehicleCard: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: colors.accent,
    borderRadius: "18px",
    border: `1px solid ${colors.border}`,
    padding: "18px",
    minHeight: "290px",
  },
  cardImageWrapper: {
    width: "100%",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f5f6fb 0%, #ffffff 100%)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
  },
  cardDetails: {
    fontSize: "14px",
    color: colors.textMuted,
    lineHeight: "1.6",
  },
  statusBadge: (status) => ({
    alignSelf: "flex-end",
    borderRadius: "999px",
    padding: "6px 12px",
    fontWeight: "700",
    fontSize: "13px",
    color: status === "available" ? colors.statusAvailable : colors.statusBusy,
    backgroundColor:
      status === "available" ? "rgba(47, 145, 81, 0.12)" : "rgba(214, 69, 69, 0.12)",
  }),
  staffCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    backgroundColor: colors.accent,
    borderRadius: "18px",
    border: `1px solid ${colors.border}`,
    padding: "18px",
    minHeight: "260px",
  },
  avatarWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `3px solid ${colors.border}`,
    backgroundColor: "#f5f6fb",
  },
  staffName: {
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
  },
  staffDetails: {
    fontSize: "14px",
    color: colors.textMuted,
    textAlign: "center",
  },
};

const vehicleCards = [
  {
    status: "busy",
    image: "/images/vehicles/van-white-1.png",
  },
  {
    status: "available",
    image: "/images/vehicles/van-white-2.png",
  },
  {
    status: "available",
    image: "/images/vehicles/van-white-3.png",
  },
  {
    status: "busy",
    image: "/images/vehicles/van-white-4.png",
  },
];

const staffCards = [
  {
    status: "busy",
    image: "/images/staff/staff-male-1.png",
    name: "นายคงกร สุขสันต์",
  },
  {
    status: "available",
    image: "/images/staff/staff-female-1.png",
    name: "นางสาวศิริพร วัฒนกิจ",
  },
  {
    status: "available",
    image: "/images/staff/staff-male-2.png",
    name: "นายสมชาย อยู่ดี",
  },
  {
    status: "busy",
    image: "/images/staff/staff-male-3.png",
    name: "นายสมปอง ใจดี",
  },
];

export default function FleetStaffPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaUsers size={26} />}
      headerSubtitle="รถและพนักงานบริษัทฯ"
    >
      <div style={styles.container}>
        <header style={styles.headerSection}>
          <div style={styles.headerLeft}>
            <div style={styles.pageTitle}>
              <FaUsers size={26} /> Company Vehicles & Drivers Dashboard
            </div>
            <p style={styles.pageSubtitle}>
              เลือกวันที่เพื่อดูความพร้อมของรถและพนักงานขับรถตามวันนั้น
            </p>
          </div>
          <span style={styles.dateBadge}>
            <FaCalendarAlt /> ข้อมูลวันนี้ <strong>02/10/2025</strong>
          </span>
        </header>

        <section style={styles.sectionBlock}>
          <h2 style={styles.sectionHeader}>
            <FaCarSide size={20} /> รถบริษัทฯ ที่มีอยู่
          </h2>
          <div style={styles.cardGrid}>
            {vehicleCards.map((card, index) => (
              <article key={`vehicle-${index}`} style={styles.vehicleCard}>
                <header style={{ fontSize: "16px", color: colors.textMuted }}>
                  Toyota Commuter Van
                </header>
                <div style={styles.cardImageWrapper}>
                  <Image
                    src={card.image}
                    alt="Toyota Commuter Van"
                    width={320}
                    height={180}
                    style={{ width: "80%", height: "auto", objectFit: "contain" }}
                  />
                </div>
                <h3 style={styles.cardTitle}>Toyota Commuter Van</h3>
                <p style={styles.cardDetails}>
                  ทะเบียน : กห 293 ปราจีนบุรี
                  <br /> ประเภทรถ : Van
                </p>
                <span
                  style={styles.statusBadge(card.status === "available" ? "available" : "busy")}
                >
                  {card.status === "available" ? "พร้อมใช้งาน" : "กำลังใช้งาน"}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.sectionBlock}>
          <h2 style={styles.sectionHeader}>
            <FaUserTie size={20} /> พนักงานขับรถบริษัทฯ
          </h2>
          <div style={styles.cardGrid}>
            {staffCards.map((card, index) => (
              <article key={`staff-${index}`} style={styles.staffCard}>
                <header style={{ fontSize: "16px", color: colors.textMuted }}>
                  นายคงกร สุขสันต์
                </header>
                <div style={styles.avatarWrapper}>
                  <Image
                    src={card.image}
                    alt="พนักงานขับรถ"
                    width={200}
                    height={200}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <h3 style={styles.staffName}>{card.name}</h3>
                <p style={styles.staffDetails}>โทร: 089-00909676</p>
                <span
                  style={styles.statusBadge(card.status === "available" ? "available" : "busy")}
                >
                  {card.status === "available" ? "พร้อมใช้งาน" : "กำลังใช้งาน"}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
