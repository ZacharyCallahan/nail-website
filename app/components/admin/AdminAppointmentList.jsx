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
import { Check, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";

export default function AdminAppointmentList() {
    const [filter, setFilter] = useState("all");

    // Mock data - in a real app this would come from the database
    const mockAppointments = [
        {
            id: "ap1",
            customer: "Jane Smith",
            service: "Gel Manicure",
            date: "2023-05-15",
            time: "10:00 AM",
            duration: "45 min",
            staff: "Sarah Johnson",
            status: "CONFIRMED",
            price: "$45.00"
        },
        {
            id: "ap2",
            customer: "Michael Brown",
            service: "Full Set Acrylic",
            date: "2023-05-15",
            time: "11:30 AM",
            duration: "60 min",
            staff: "Jessica Lee",
            status: "PENDING",
            price: "$75.00"
        },
        {
            id: "ap3",
            customer: "Emily Davis",
            service: "Pedicure Deluxe",
            date: "2023-05-15",
            time: "1:15 PM",
            duration: "60 min",
            staff: "Michael Chen",
            status: "CONFIRMED",
            price: "$65.00"
        },
        {
            id: "ap4",
            customer: "Robert Wilson",
            service: "Nail Art Add-on",
            date: "2023-05-15",
            time: "2:30 PM",
            duration: "30 min",
            staff: "Sarah Johnson",
            status: "CANCELED",
            price: "$25.00"
        },
        {
            id: "ap5",
            customer: "Linda Johnson",
            service: "Spa Mani-Pedi",
            date: "2023-05-16",
            time: "9:00 AM",
            duration: "90 min",
            staff: "Jessica Lee",
            status: "PENDING",
            price: "$95.00"
        }
    ];

    // Filter appointments based on status
    const filteredAppointments = filter === 'all'
        ? mockAppointments
        : mockAppointments.filter(appointment => appointment.status === filter);

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
                        {filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell className="font-medium">{appointment.customer}</TableCell>
                                    <TableCell>{appointment.service}</TableCell>
                                    <TableCell>
                                        {appointment.date} <span className="block text-muted-foreground text-xs">{appointment.time} ({appointment.duration})</span>
                                    </TableCell>
                                    <TableCell>{appointment.staff}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusBadgeStyles(appointment.status)}>
                                            {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{appointment.price}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
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
                                                    <DropdownMenuItem className="text-green-600">
                                                        <Check className="mr-2 h-4 w-4" /> Confirm
                                                    </DropdownMenuItem>
                                                )}

                                                {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                                                    <DropdownMenuItem className="text-red-600">
                                                        <X className="mr-2 h-4 w-4" /> Cancel
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