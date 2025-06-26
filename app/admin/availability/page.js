import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AvailabilityManager from "@/app/components/admin/AvailabilityManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin - Availability",
    description: "Manage staff availability and schedules"
};

export default async function AdminAvailabilityPage() {
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin?error=You must be an admin to access this page");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Staff Availability</h1>
                <p className="text-muted-foreground">
                    Manage staff schedules and availability for bookings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Availability Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <AvailabilityManager />
                </CardContent>
            </Card>
        </div>
    );
} 