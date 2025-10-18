"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_ROLE, ROLE_LABELS, getMenuItemsForRole, normalizeRole } from "@/lib/menuItems";
import {
  FaCarSide,
  FaLocationDot,
  FaClipboardList,
  FaUsers,
  FaChevronRight,
} from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";

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
  },
  mainForm: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  sectionCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    backgroundColor: colors.accent,
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700",
    color: colors.primary,
  },
  formGrid: (columns = 3) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: "18px",
  }),
  label: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  input: {
    width: "100%",
    height: "44px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "0 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: "#ffffff",
  },
  textarea: {
    width: "100%",
    minHeight: "76px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "12px 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: "#ffffff",
  },
  fileUpload: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  fileButton: {
    padding: "10px 16px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.primary}`,
    backgroundColor: "#ffffff",
    color: colors.primary,
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  asideActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "8px",
    width: "100%",
  },
  actionButton: (variant = "primary") => ({
    minWidth: "180px",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    fontSize: "18px",
    fontWeight: "800",
    color: variant === "dark" ? "#ffffff" : colors.primary,
    backgroundColor:
      variant === "primary"
        ? "#e6f0ff"
        : variant === "outline"
        ? "#ffffff"
        : "#0b3d80",
    boxShadow: variant === "dark" ? "0 10px 24px rgba(11, 61, 128, 0.35)" : "none",
    border: variant === "outline" ? `1.5px solid ${colors.primary}` : "none",
    cursor: "pointer",
  }),
  row: {
    display: "flex",
    gap: "18px",
  },
  routeSection: {
    borderRadius: "22px",
    backgroundColor: "#ffffff",
    padding: "24px 26px",
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  routeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "800",
    color: colors.primary,
  },
  routeIconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    backgroundColor: "#ecf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.primary,
  },
  routeDescription: {
    margin: 0,
    color: colors.textLight,
    fontSize: "14px",
  },
  pointCards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  pointCard: {
    backgroundColor: "#fafdff",
    borderRadius: "20px",
    border: `2px solid ${colors.border}`,
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  pointHeaderBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  pointHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: colors.primary,
  },
  pointNote: {
    margin: 0,
    fontSize: "13px",
    color: colors.textLight,
  },
  pointTabs: {
    display: "flex",
    gap: "10px",
  },
  pointTab: (active = false) => ({
    padding: "6px 18px",
    borderRadius: "18px",
    border: active ? "2px solid #1b5ec2" : `1px solid ${colors.border}`,
    backgroundColor: active ? "#eef4ff" : "#f8faff",
    color: active ? colors.primary : colors.textLight,
    fontSize: "14px",
    fontWeight: "700",
  }),
  pointTabLabel: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    color: colors.textLight,
    fontSize: "14px",
    fontWeight: "700",
  },
  pointGridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  pointGridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  pointGridOne: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
  },
  subSectionLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
    marginTop: "4px",
  },
  bottomNote: {
    margin: 0,
    fontSize: "13px",
    color: colors.textLight,
    textAlign: "right",
  },
};

function LabeledField({ label, required = false, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column" }}>
      <span style={styles.label}>
        {label}
        {required ? <span style={{ color: "#d24c5a" }}>*</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function CompanyBookingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(DEFAULT_ROLE);
  const [displayName, setDisplayName] = useState("");

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
        if (nameCandidate) {
          setDisplayName(nameCandidate);
        }
      }
    } catch (error) {
      console.warn("Failed to restore stored session", error);
    }
  }, []);

  const normalizedRole = normalizeRole(userRole);
  const visibleMenuItems = useMemo(() => getMenuItemsForRole(normalizedRole), [normalizedRole]);
  const roleLabel = ROLE_LABELS[normalizedRole] || normalizedRole;
  const welcomeText = displayName ? `${displayName} (${roleLabel})` : roleLabel;

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => router.push("/")}
          >
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
                const isActive = item.path ? pathname === item.path : false;

                return (
                  <li
                    key={item.label}
                    style={styles.menuItem(isActive)}
                    onClick={item.path ? () => router.push(item.path) : undefined}
                  >
                    <span style={styles.menuIcon}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive ? <FaChevronRight size={14} /> : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </aside>

      <section style={styles.contentArea}>
        <header style={styles.topBar}>
          <div style={styles.topBarTitle}>
            <FaCarSide size={26} />
            Vehicle Service <span style={{ fontWeight: "600" }}>จองรถบริษัทฯ (สำหรับผู้จอง)</span>
          </div>
          <p style={styles.welcome}>ยินดีต้อนรับ {welcomeText}</p>
        </header>

        <div style={styles.body}>
          <div style={styles.mainForm}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <FaCarSide size={20} /> ข้อมูลผู้จองรถบริษัทฯ
              </div>
              <p style={{ color: colors.textLight, margin: 0, fontSize: "14px" }}>
                โปรดกรอกข้อมูลให้ครบถ้วน เพื่อใช้ในการติดต่อประสานงาน
              </p>
              <div style={styles.formGrid(3)}>
                <LabeledField label="รหัสพนักงานผู้จอง" required>
                  <input style={styles.input} />
                </LabeledField>
                <LabeledField label="ชื่อผู้จอง" required>
                  <input style={styles.input}  />
                </LabeledField>
                <LabeledField label="โรงงาน" required>
                  <select style={styles.input}>
                    <option>เลือกโรงงาน</option>
                    <option>โรงงาน 1</option>
                    <option>โรงงาน 2</option>
                  </select>
                </LabeledField>
                <LabeledField label="แผนก" required>
                  <select style={styles.input}>
                    <option>เลือกแผนก</option>
                    <option>GA Service</option>
                    <option>Operation</option>
                  </select>
                </LabeledField>
                <LabeledField label="ฝ่าย" required>
                  <select style={styles.input}>
                    <option>เลือกฝ่าย</option>
                    <option>GA</option>
                    <option>SAC</option>
                  </select>
                </LabeledField>
                <LabeledField label="เบอร์ติดต่อกลับ" required>
                  <input style={styles.input}  />
                </LabeledField>
                <LabeledField label="E-mail ติดต่อกลับ" required>
                  <input style={styles.input}  />
                </LabeledField>
              </div>
            </section>

            <section style={styles.routeSection}>
              <div style={styles.routeHeader}>
                <span style={styles.routeIconWrap}>
                  <FaLocationDot size={20} />
                </span>
                จุดรับ-ส่ง (เพิ่มได้หลายจุด)
              </div>
              <p style={styles.routeDescription}>
                กำหนดเส้นทาง / ปลายทาง พร้อมข้อมูลเที่ยวบินและหมายเหตุถึงคนขับ
              </p>
              <div style={styles.pointCards}>
                <div style={styles.pointCard}>
                  <div style={styles.pointHeaderBlock}>
                    <div style={styles.pointHeaderRow}>
                      <h4 style={styles.pointTitle}>จุดที่ 1</h4>
                      <span style={styles.pointNote}>ข้อมูลจุดขึ้นโดยสาร</span>
                    </div>
                    <div style={styles.pointTabs}>
                      <span style={styles.pointTab(true)}>ค้นหา</span>
                      <span style={styles.pointTabLabel}>ข้อมูลจุดขึ้นโดยสาร</span>
                    </div>
                  </div>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="วันรถออก" required>
                      <input style={styles.input} type="text" defaultValue="02/10/2025" />
                    </LabeledField>
                    <LabeledField label="เวลารถออก" required>
                      <input style={styles.input} type="time" />
                    </LabeledField>
                    <LabeledField label="จำนวนผู้โดยสารขึ้นจุดนี้" required>
                      <input style={styles.input} type="number" min="1" defaultValue="1" />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridOne}>
                    <LabeledField label="รายชื่อคนขึ้นจุดนี้">
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="สถานที่รับ" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                    <LabeledField label="อำเภอ" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                    <LabeledField label="จังหวัด" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <p style={styles.subSectionLabel}>เดินทางโดยเครื่องบิน (จุดต้นทาง)</p>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="เที่ยวบิน">
                      <input style={styles.input} placeholder="เช่น TG123" />
                    </LabeledField>
                    <LabeledField label="เวลาแลนดิ้ง">
                      <input style={styles.input} type="time" />
                    </LabeledField>
                    <LabeledField label="หมายเหตุถึงคนขับ+ต้นทาง">
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <button type="button" style={styles.fileButton}>
                    + เพิ่มจุดรับ - ส่งถัดไป
                  </button>
                </div>

                <div style={styles.pointCard}>
                  <div style={styles.pointHeaderBlock}>
                    <div style={styles.pointHeaderRow}>
                      <h4 style={styles.pointTitle}>ปลายทาง</h4>
                      <span style={styles.pointNote}>ข้อมูลจุดรับผู้โดยสาร</span>
                    </div>
                    <div style={styles.pointTabs}>
                      <span style={styles.pointTab(true)}>ปลายทาง</span>
                      <span style={styles.pointTabLabel}>ข้อมูลจุดรับผู้โดยสาร</span>
                    </div>
                  </div>
                  <div style={styles.pointGridThree}>
                    
                    <LabeledField label="เวลาถึงปลายทาง" required>
                      <input style={styles.input} type="time" />
                    </LabeledField>
                    <LabeledField label="จำนวนผู้โดยสารขึ้นจุดนี้" required>
                      <input style={styles.input} type="number" min="1" defaultValue="1" />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridOne}>
                    <LabeledField label="รายชื่อคนขึ้นจุดนี้">
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="สถานที่รับ" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                    <LabeledField label="อำเภอ" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                    <LabeledField label="จังหวัด" required>
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <p style={styles.subSectionLabel}>เดินทางโดยเครื่องบิน (จุดปลายทาง)</p>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="เที่ยวบิน">
                      <input style={styles.input} placeholder="เช่น TG123" />
                    </LabeledField>
                    <LabeledField label="เวลาแลนดิ้ง">
                      <input style={styles.input} type="time" />
                    </LabeledField>
                    <LabeledField label="หมายเหตุถึงคนขับ+ปลายทาง">
                      <input style={styles.input} placeholder="" />
                    </LabeledField>
                  </div>
                  <p style={styles.bottomNote}>สามารถเพิ่มได้หลายจุดตามลำดับการเดินทาง</p>
                </div>
              </div>
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <FaClipboardList size={20} /> ระบุกรณีมีของบรรทุกบนรถ
              </div>
              <LabeledField label="ระบุรายละเอียด" required>
                <textarea style={styles.textarea} placeholder="ระบุรายละเอียด เช่น ประเภทของสิ่งของ ขนาดหรือน้ำหนัก จุดโหลด/สิ่งที่ควรระวัง"></textarea>
              </LabeledField>
              <div style={styles.fileUpload}>
                <span style={{ fontWeight: "700", color: colors.textDark }}>ยืนยันรถที่ใช้</span>
                <button type="button" style={styles.fileButton}>Choose Files</button>
                <span style={{ color: colors.textLight, fontSize: "14px" }}>No file chosen</span>
              </div>
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <FaUsers size={20} /> สำหรับพนักงาน GA Service
              </div>
              <p style={styles.routeDescription}>
                ยืนยันการจัดรถ ในกรณีไม่อนุมัติการจอง โปรดระบุเหตุผล
              </p>
              <div style={styles.formGrid(3)}>
                <LabeledField label="ยืนยันพนักงานขับรถ" required>
                  <input style={styles.input}  />
                </LabeledField>
                <LabeledField label="เบอร์โทรพนักงานขับรถ" required>
                  <input style={styles.input}  />
                </LabeledField>
                <LabeledField label="ยืนยันรถที่ใช้" required>
                  <select style={styles.input}>
                    <option>เลือกรถ</option>
                    <option>5ก-5902</option>
                    <option>7ก-2087</option>
                  </select>
                </LabeledField>
                <LabeledField label="ประเภทรถ" required>
                  <select style={styles.input}>
                    <option>ระบุ</option>
                    <option>รถเก๋ง</option>
                    <option>รถตู้</option>
                  </select>
                </LabeledField>
                <LabeledField label="สถานะการจอง" required>
                  <select style={styles.input}>
                    <option>ระบุ</option>
                    <option>อนุมัติ</option>
                    <option>ไม่อนุมัติ</option>
                  </select>
                </LabeledField>
                <LabeledField label="เหตุผลการไม่อนุมัติ" required>
                  <input style={styles.input} />
                </LabeledField>
              </div>
            </section>
          </div>

          <div style={styles.asideActions}>
            <button type="button" style={styles.actionButton("outline")}>
              ยกเลิกการจอง
            </button>
            <button type="button" style={styles.actionButton("dark")}>
              บันทึกการจอง
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
