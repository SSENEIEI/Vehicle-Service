import {
  FaCarSide,
  FaKey,
  FaScrewdriverWrench,
  FaCalendarDay,
  FaClipboardList,
  FaUsers,
  FaUserGear,
} from "react-icons/fa6";

export const VALID_ROLES = ["admin", "user", "vendor"];
export const DEFAULT_ROLE = "admin";

export const ROLE_LABELS = {
  admin: "ผู้ดูแลระบบ",
  user: "ผู้ใช้งาน",
  vendor: "ผู้ขาย",
};

export const menuItems = [
  {
    label: "จองรถบริษัทฯ",
    icon: <FaCarSide size={24} />,
    path: "/company-booking",
    roles: ["admin", "user"],
  },
  {
    label: "จองรถเช่า",
    icon: <FaKey size={22} />,
    path: "/rental-booking",
    roles: ["admin", "user"],
  },
  {
    label: "ซ่อมรถ",
    icon: <FaScrewdriverWrench size={22} />,
    path: "/repair",
    roles: ["admin", "vendor"],
  },
  {
    label: "แผนจัดรถประจำวัน",
    icon: <FaCalendarDay size={22} />,
    path: "/daily-schedule",
    roles: ["admin", "user"],
  },
  {
    label: "แผนการใช้รถภาพรวม",
    icon: <FaClipboardList size={22} />,
    path: "/overall-plan",
    roles: ["admin", "user"],
  },
  {
    label: "รถและพนักงานบริษัทฯ",
    icon: <FaUsers size={22} />,
    path: "/fleet-staff",
    roles: ["admin", "user"],
  },
  {
    label: "จัดการผู้ใช้",
    icon: <FaUserGear size={22} />,
    path: "/user-management",
    roles: ["admin"],
  },
];

export function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return VALID_ROLES.includes(normalized) ? normalized : DEFAULT_ROLE;
}

export function getMenuItemsForRole(role) {
  const normalizedRole = normalizeRole(role);
  return menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(normalizedRole);
  });
}
