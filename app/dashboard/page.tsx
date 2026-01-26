import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react";
import DashboardComp from "@/components/DashboardComp";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);


  return (
      <div className="relative">
        <h1 className="text-xl m-2 font-semibold">Welcome {session?.user.name}</h1>
        <DashboardComp/>
    </div>
  );
}
