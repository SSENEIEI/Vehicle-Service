import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaClipboardList } from "react-icons/fa6";

export const metadata = {
	title: "แผนการใช้รถภาพรวม | Vehicle Service",
};

export default function OverallPlanPage() {
	return (
		<DashboardShell
			menuItems={menuItems}
			headerIcon={<FaClipboardList size={26} />}
			headerSubtitle="แผนการใช้รถภาพรวม"
		/>
	);
}
