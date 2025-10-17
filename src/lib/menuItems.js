import {
  FaCarSide,
  FaKey,
  FaScrewdriverWrench,
  FaCalendarDay,
  FaClipboardList,
  FaUsers,
  FaUserGear,
} from "react-icons/fa6";

export const menuItems = [
  { label: "จองรถบริษัทฯ", icon: <FaCarSide size={24} />, path: "/company-booking" },
  { label: "จองรถเช่า", icon: <FaKey size={22} />, path: "/rental-booking" },
  { label: "ซ่อมรถ", icon: <FaScrewdriverWrench size={22} />, path: "/repair" },
  { label: "แผนจัดรถประจำวัน", icon: <FaCalendarDay size={22} />, path: "/daily-schedule" },
  { label: "แผนการใช้รถภาพรวม", icon: <FaClipboardList size={22} />, path: "/overall-plan" },
  { label: "รถและพนักงานบริษัทฯ", icon: <FaUsers size={22} />, path: "/fleet-staff" },
  { label: "จัดการผู้ใช้", icon: <FaUserGear size={22} />, path: "/user-management" },
];
