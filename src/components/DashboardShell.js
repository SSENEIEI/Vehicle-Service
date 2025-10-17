"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";

const colors = {
  primary: "#0c4aa1",
  sidebarBg: "#0d4fa6",
  sidebarActive: "#0a3d80",
  accent: "#f4f8ff",
  border: "#c7d6f3",
  textDark: "#0f274f",
  textLight: "#5c6f9c",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#e9f1ff",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  sidebar: {
    width: "280px",
    backgroundColor: colors.sidebarBg,
    color: "#ffffff",
    padding: "26px 22px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "4px 0 20px rgba(10, 32, 74, 0.22)",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#08386e",
    color: "#ffffff",
    borderRadius: "14px",
    border: "none",
    padding: "10px 18px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  languageToggle: {
    marginLeft: "auto",
    backgroundColor: "#ffffff",
    color: colors.primary,
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
  },
  menuTitle: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.6px",
    marginBottom: "8px",
  },
  menuList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  menuItem: (active = false) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    borderRadius: "16px",
    backgroundColor: active ? colors.sidebarActive : "transparent",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: active ? "700" : "600",
    letterSpacing: "0.4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  }),
  menuIcon: {
    width: "28px",
    height: "28px",
  },
  contentArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px 36px",
    gap: "22px",
  },
  topBar: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px 28px",
    boxShadow: "0 12px 24px rgba(15, 59, 124, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: colors.primary,
    fontSize: "24px",
    fontWeight: "800",
  },
  welcome: {
    color: colors.primary,
    fontSize: "18px",
    fontWeight: "700",
  },
  body: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    padding: "32px",
    boxShadow: "0 12px 28px rgba(15, 59, 124, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    width: "100%",
    minHeight: "420px",
  },
};

export default function DashboardShell({ menuItems, headerIcon, headerSubtitle, children }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="button" style={styles.backButton} onClick={() => router.push("/")}>
            <FaArrowLeft /> กลับเมนูหลัก
          </button>
          <button type="button" style={styles.languageToggle}>
            EN
          </button>
        </div>

        <div>
          <p style={styles.menuTitle}>เมนู</p>
          <ul style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <li key={item.path} style={styles.menuItem(isActive)}>
                  <span style={styles.menuIcon}>{item.icon}</span>
                  <Link
                    href={item.path}
                    style={{ flex: 1, color: "inherit", textDecoration: "none" }}
                  >
                    {item.label}
                  </Link>
                  {isActive ? <FaChevronRight size={14} /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <section style={styles.contentArea}>
        <header style={styles.topBar}>
          <div style={styles.topBarTitle}>
            {headerIcon}
            Vehicle Service <span style={{ fontWeight: "600" }}>{headerSubtitle}</span>
          </div>
          <p style={styles.welcome}>ยินดีต้อนรับ Admin SAC (AC)</p>
        </header>

        <div style={styles.body}>{children}</div>
      </section>
    </main>
  );
}
