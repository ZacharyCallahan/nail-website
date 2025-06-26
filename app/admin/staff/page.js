import { auth } from "@/app/api/auth/[...nextauth]/route";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Dynamically import the StaffManagerWrapper component
const StaffManagerWrapper = dynamic(() => import("@/app/components/admin/StaffManagerWrapper"), {
    loading: () => <div>Loading staff manager...</div>
});

export const metadata = {
    title: "Staff Management | Elegant Nails Admin",
    description: "Manage staff members, their schedules, and service offerings.",
};

export default async function StaffManagementPage() {
    // Server-side authentication check
    const session = await auth();

    // If not logged in or not an admin, redirect to login page
    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin?callbackUrl=/admin/staff");
    }

    return (
        <Suspense fallback={<div>Loading staff manager...</div>}>
            <StaffManagerWrapper />
        </Suspense>
    );
} 