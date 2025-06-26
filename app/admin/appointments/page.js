import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminAppointmentList from "@/app/components/admin/AdminAppointmentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin - Appointments",
    description: "Manage all salon appointments"
};

export default async function AdminAppointmentsPage() {
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin?error=You must be an admin to access this page");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Appointments</h1>
                <p className="text-muted-foreground">
                    Manage all appointments and bookings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminAppointmentList />
                </CardContent>
            </Card>
        </div>
    );
} 