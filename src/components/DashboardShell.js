"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaBars, FaTimes } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";
import { DEFAULT_ROLE, ROLE_LABELS, getMenuItemsForRole, normalizeRole } from "@/lib/menuItems";

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
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  menuToggleButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: colors.primary,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(12, 74, 161, 0.25)",
    transition: "background-color 0.2s ease",
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

export default function DashboardShell({
  menuItems,
  headerIcon,
  headerSubtitle,
  children,
  sidebarMode = "static",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isOverlaySidebar = sidebarMode === "overlay";
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isOverlaySidebar);
  const [userRole, setUserRole] = useState(DEFAULT_ROLE);
  const [profileSummary, setProfileSummary] = useState({
    name: "",
    department: "",
    factory: "",
  });

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole");
      if (storedRole) {
        setUserRole(normalizeRole(storedRole));
      }
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        const nameCandidate =
          parsedProfile?.displayName ||
          parsedProfile?.fullName ||
          parsedProfile?.name ||
          parsedProfile?.username ||
          "";
        setProfileSummary({
          name: nameCandidate || "",
          department:
            parsedProfile?.departmentName ||
            parsedProfile?.department ||
            "",
          factory:
            parsedProfile?.factoryName ||
            parsedProfile?.factory ||
            "",
        });
      }
    } catch (error) {
      console.warn("Failed to restore stored session", error);
    }
  }, []);

  const normalizedRole = normalizeRole(userRole);

  const visibleMenuItems = useMemo(() => {
    if (Array.isArray(menuItems) && menuItems.length) {
      return menuItems.filter((item) => {
        if (!item?.roles || item.roles.length === 0) {
          return true;
        }
        return item.roles.includes(normalizedRole);
      });
    }
    return getMenuItemsForRole(normalizedRole);
  }, [menuItems, normalizedRole]);

  const roleLabel = ROLE_LABELS[normalizedRole] || normalizedRole;
  let welcomeText;
  if (normalizedRole === "admin") {
    welcomeText = "ผู้ดูแลระบบ";
  } else {
    const baseName = profileSummary.name || roleLabel;
    let composed = baseName;
    if (profileSummary.department) {
      composed += ` ${profileSummary.department}`;
    }
    if (profileSummary.factory) {
      composed += ` (${profileSummary.factory})`;
    } else if (!profileSummary.department && roleLabel && roleLabel !== baseName) {
      composed += ` (${roleLabel})`;
    }
    welcomeText = composed;
  }

  const containerStyle = {
    ...styles.page,
    display: isOverlaySidebar ? "block" : styles.page.display,
    position: "relative",
  };

  const overlaySidebarStyles = isOverlaySidebar
    ? {
        position: "fixed",
        top: 0,
        left: isSidebarOpen ? 0 : -320,
        height: "100vh",
        width: "280px",
        transition: "left 0.3s ease",
        zIndex: 30,
      }
    : {};

  const overlayBackdropStyles = isOverlaySidebar
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(8, 18, 45, 0.4)",
        opacity: isSidebarOpen ? 1 : 0,
        visibility: isSidebarOpen ? "visible" : "hidden",
        transition: "opacity 0.3s ease, visibility 0.3s ease",
        zIndex: 20,
      }
    : null;

  const contentAreaStyle = {
    ...styles.contentArea,
    marginLeft: isOverlaySidebar ? 0 : undefined,
  };

  const sidebarContent = (
    <>
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
          {visibleMenuItems.length === 0 ? (
            <li
              style={{
                ...styles.menuItem(false),
                justifyContent: "center",
                opacity: 0.65,
                pointerEvents: "none",
              }}
            >
              ไม่มีเมนูที่สามารถเข้าถึงได้
            </li>
          ) : (
            visibleMenuItems.map((item) => {
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
            })
          )}
        </ul>
      </div>
    </>
  );

  const handleToggleSidebar = () => {
    if (isOverlaySidebar) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <main style={containerStyle}>
      {isOverlaySidebar ? (
        <>
          <div
            role="presentation"
            style={overlayBackdropStyles}
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside style={{ ...styles.sidebar, ...overlaySidebarStyles }}>{sidebarContent}</aside>
        </>
      ) : (
        <aside style={styles.sidebar}>{sidebarContent}</aside>
      )}

      <section style={contentAreaStyle}>
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            {isOverlaySidebar ? (
              <button type="button" style={styles.menuToggleButton} onClick={handleToggleSidebar}>
                {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            ) : null}
            <div style={styles.topBarTitle}>
              {headerIcon}
              Vehicle Service <span style={{ fontWeight: "600" }}>{headerSubtitle}</span>
            </div>
          </div>
          <p style={styles.welcome}>ยินดีต้อนรับ {welcomeText}</p>
        </header>

        <div style={styles.body}>{children}</div>
      </section>
    </main>
  );
}
