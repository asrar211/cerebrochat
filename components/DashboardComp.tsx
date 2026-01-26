"use client"
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardComp() {
    const handleLogout =async () => {
        await signOut();
        redirect("/")
    }
    return (
        <div className="flex flex-col h-dvh justify-center items-center">
            <button className="absolute top-0 right-2 bg-red-600 text-white rounded-full py-1 px-2 text-sm" onClick={handleLogout}>Logout</button>
            <button className="border border-green-200 rounded-full px-3 py-1.5 cursor-pointer shadow-md text-sm text-green-600">Start Your Session</button>
        </div>
    )
};
