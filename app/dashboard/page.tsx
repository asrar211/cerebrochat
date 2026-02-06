import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardPanel from "@/features/dashboard/DashboardPanel";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  return <DashboardPanel userName={session?.user?.name} />;
}
