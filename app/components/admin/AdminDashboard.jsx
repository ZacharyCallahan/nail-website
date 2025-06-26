"use client";

import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
    Calendar as CalendarIcon,
    Check,
    Clock,
    DollarSign,
    Users,
    X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AdminAppointmentList from "./AdminAppointmentList";
import AvailabilityManager from "./AvailabilityManager";

export default function AdminDashboard() {
    const [date, setDate] = useState(new Date());

    // Mock data - in a real app this would come from the database
    const dashboardStats = {
        totalAppointments: 24,
        todayAppointments: 8,
        weekRevenue: "$1,245.00",
        monthRevenue: "$5,280.00"
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage appointments, staff, services, and salon operations
                </p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Appointments</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.totalAppointments}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Today's Appointments</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.todayAppointments}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Weekly Revenue</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.weekRevenue}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.monthRevenue}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="appointments">
                <TabsList>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Recent Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminAppointmentList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="availability" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Manage Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    asChild
                >
                    <Link href="/admin/staff">
                        <Users className="h-6 w-6" />
                        <span>Manage Staff</span>
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    asChild
                >
                    <Link href="/admin/availability">
                        <CalendarIcon className="h-6 w-6" />
                        <span>Manage Availability</span>
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    asChild
                >
                    <Link href="/admin/services">
                        <Check className="h-6 w-6" />
                        <span>Manage Services</span>
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    asChild
                >
                    <Link href="/admin/appointments">
                        <X className="h-6 w-6" />
                        <span>View Appointments</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
} 