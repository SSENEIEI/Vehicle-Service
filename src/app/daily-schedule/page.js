import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaCalendarDay } from "react-icons/fa6";

export const metadata = {
  title: "แผนจัดรถประจำวัน | Vehicle Service",
};

export default function DailySchedulePage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaCalendarDay size={26} />}
      headerSubtitle="แผนจัดรถประจำวัน"
    />
  );
}
