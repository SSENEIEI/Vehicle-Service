import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaScrewdriverWrench } from "react-icons/fa6";
import RepairBiddingClient from "./RepairBiddingClient";

export const metadata = {
  title: "ประมูลซ่อมรถ | Vehicle Service",
};

export default function RepairBiddingPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ / ประมูลซ่อมรถ"
    >
      <RepairBiddingClient />
    </DashboardShell>
  );
}
