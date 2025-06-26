import { auth } from "@/app/api/auth/[...nextauth]/route";
import StaffManagerComponent from "@/app/components/admin/StaffManager";
import { redirect } from "next/navigation";

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

    return <StaffManagerComponent />;
} 