import { WelcomeBanner } from "../components/dashboard/WelcomeBanner";
import { QuickCreateGrid } from "../components/dashboard/QuickCreateGrid";
import { RecentResources } from "../components/dashboard/RecentResources";

export default function Dashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <WelcomeBanner />
      <QuickCreateGrid />
      <RecentResources />
    </div>
  );
}
