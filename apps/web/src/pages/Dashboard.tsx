import { WelcomeBanner } from "../components/dashboard/WelcomeBanner";
import { QuickCreateGrid } from "../components/dashboard/QuickCreateGrid";
import { RecentResources } from "../components/dashboard/RecentResources";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <QuickCreateGrid />
      <RecentResources />
    </div>
  );
}
