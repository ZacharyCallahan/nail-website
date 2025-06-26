import { auth } from "@/app/api/auth/[...nextauth]/route";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Dynamically import the ServicesManagerWrapper component
const ServicesManagerWrapper = dynamic(() => import("@/app/components/admin/ServicesManagerWrapper"), {
    loading: () => <div>Loading services manager...</div>
});

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

    return (
        <Suspense fallback={<div>Loading services manager...</div>}>
            <ServicesManagerWrapper />
        </Suspense>
    );
} 