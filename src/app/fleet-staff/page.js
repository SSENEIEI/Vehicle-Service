import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaUsers } from "react-icons/fa6";

export const metadata = {
  title: "รถและพนักงานบริษัทฯ | Vehicle Service",
};

export default function FleetStaffPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaUsers size={26} />}
      headerSubtitle="รถและพนักงานบริษัทฯ"
    />
  );
}
