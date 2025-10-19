import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaScrewdriverWrench } from "react-icons/fa6";
import RepairReportForm from "./RepairReportForm";

export const metadata = {
  title: "แจ้งซ่อมรถ | Vehicle Service",
};

export default function RepairReportPage() {
  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaScrewdriverWrench size={26} />}
      headerSubtitle="ซ่อมรถ / แจ้งซ่อม"
    >
      <RepairReportForm />
    </DashboardShell>
  );
}
