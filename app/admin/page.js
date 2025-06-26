import { auth } from "@/app/api/auth/[...nextauth]/route";
import AdminDashboard from "@/app/components/admin/AdminDashboard";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin Dashboard | Elegant Nails",
    description: "Admin dashboard for Elegant Nails to manage appointments, services, and more.",
};

export default async function AdminPage() {
    // Server-side authentication check
    const session = await auth();

    // If not logged in or not an admin, redirect to login page
    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin?callbackUrl=/admin");
    }

    return <AdminDashboard />;
} 