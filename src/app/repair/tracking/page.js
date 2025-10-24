import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaScrewdriverWrench } from "react-icons/fa6";
import RepairTrackingClient from "./RepairTrackingClient";

export const metadata = {
  title: "ติดตามงานซ่อม | Vehicle Service",
};

export default function RepairTrackingPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ / ติดตามงานซ่อม"
    >
      <RepairTrackingClient />
    </DashboardShell>
  );
}
