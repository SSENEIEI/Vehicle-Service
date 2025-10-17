import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaScrewdriverWrench } from "react-icons/fa6";

export const metadata = {
  title: "ซ่อมรถ | Vehicle Service",
};

const actionStyles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    padding: "12px 0",
  },
  button: (backgroundColor) => ({
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderRadius: "32px",
    border: "none",
    padding: "22px 28px",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.2px",
    color: "#ffffff",
    backgroundColor,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(12, 74, 161, 0.18)",
    textDecoration: "none",
  }),
  subtitle: (color) => ({
    fontSize: "16px",
    fontWeight: "600",
    color,
  }),
};

const actionButtons = [
  { label: "แจ้งซ่อม", background: "#0d5fbf", href: "/repair/report" },
  { label: "ติดตามงานซ่อม", background: "#0d5fbf", href: "/repair/tracking" },
  {
    label: "ประมูลซ่อมรถ",
    background: "#1b7c3a",
    subtitle: "(สำหรับ Vendor)",
    subtitleColor: "#ffd54f",
    href: "/repair/bidding",
  },
];

export default function RepairPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ"
    >
      <div style={actionStyles.wrapper}>
        {actionButtons.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            style={actionStyles.button(action.background)}
          >
            <span>{action.label}</span>
            {action.subtitle ? (
              <span style={actionStyles.subtitle(action.subtitleColor || "#ffffff")}>{action.subtitle}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
