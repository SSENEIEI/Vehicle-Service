import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaUserGear } from "react-icons/fa6";

export const metadata = {
  title: "จัดการผู้ใช้ | Vehicle Service",
};

export default function UserManagementPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaUserGear size={26} />}
      headerSubtitle="จัดการผู้ใช้"
    />
  );
}
