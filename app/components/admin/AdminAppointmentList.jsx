"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/app/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import { Check, Loader2, MoreHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminAppointmentList() {
    const [filter, setFilter] = useState("all");
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch appointments data
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/appointments');

                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data = await response.json();
                setAppointments(data.appointments);
                setError(null);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Failed to load appointments. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    // Function to update appointment status
    const updateAppointmentStatus = async (id, status) => {
        try {
            setIsUpdating(true);
            const response = await fetch('/api/admin/appointments', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update appointment status');
            }

            // Update the appointment in the local state
            setAppointments(prev => prev.map(appointment => {
                if (appointment.id === id) {
                    return { ...appointment, status };
                }
                return appointment;
            }));

        } catch (error) {
            console.error("Error updating appointment status:", error);
            setError("Failed to update appointment status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Filter appointments based on status
    const filteredAppointments = filter === 'all'
        ? appointments
        : appointments.filter(appointment => appointment.status === filter);

    const getStatusBadgeStyles = (status) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-800 hover:bg-green-100";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "CANCELED":
                return "bg-red-100 text-red-800 hover:bg-red-100";
            case "COMPLETED":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Appointments</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm">
                    Export
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Staff</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p className="text-muted-foreground">Loading appointments...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell className="font-medium">
                                        {appointment.customer.name}
                                        <span className="block text-xs text-muted-foreground">
                                            {appointment.customer.email}
                                        </span>
                                    </TableCell>
                                    <TableCell>{appointment.service.name}</TableCell>
                                    <TableCell>
                                        {formatDate(appointment.startTime, 'PPP')}
                                        <span className="block text-muted-foreground text-xs">
                                            {formatTime(appointment.startTime)} ({appointment.service.duration} min)
                                        </span>
                                    </TableCell>
                                    <TableCell>{appointment.staff.user.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusBadgeStyles(appointment.status)}>
                                            {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${appointment.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={isUpdating}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit appointment</DropdownMenuItem>
                                                <DropdownMenuItem>Send reminder</DropdownMenuItem>

                                                {appointment.status === "PENDING" && (
                                                    <DropdownMenuItem
                                                        className="text-green-600"
                                                        onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" /> Confirm
                                                    </DropdownMenuItem>
                                                )}

                                                {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => updateAppointmentStatus(appointment.id, "CANCELED")}
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Cancel
                                                    </DropdownMenuItem>
                                                )}

                                                {appointment.status === "CONFIRMED" && (
                                                    <DropdownMenuItem
                                                        className="text-blue-600"
                                                        onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" /> Mark as Completed
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 