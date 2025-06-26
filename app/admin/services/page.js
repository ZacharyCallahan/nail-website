import { auth } from "@/app/api/auth/[...nextauth]/route";
import ServicesManager from "@/app/components/admin/ServicesManager";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Services Management | Elegant Nails Admin",
    description: "Manage nail salon services, add-ons, prices, and descriptions.",
};

export default async function ServicesPage() {
    // Server-side authentication check
    const session = await auth();

    // If not logged in or not an admin, redirect to login page
    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin?callbackUrl=/admin/services");
    }

    return <ServicesManager />;
} 