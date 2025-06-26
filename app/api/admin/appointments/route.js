import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all appointments with customer, staff, and service details
export async function GET() {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const appointments = await prisma.appointment.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                staff: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                service: true,
                addOns: {
                    include: {
                        addOn: true,
                    }
                },
                payment: true,
            },
            orderBy: {
                startTime: 'desc',
            },
        });
        
        return NextResponse.json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create a new appointment
export async function POST(request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const data = await request.json();
        
        // Basic validation
        if (!data.customerId || !data.staffId || !data.serviceId || !data.startTime || !data.endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                customerId: data.customerId,
                staffId: data.staffId, 
                serviceId: data.serviceId,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                status: data.status || "PENDING",
                totalPrice: data.totalPrice,
                notes: data.notes,
            }
        });
        
        // Add any add-ons if provided
        if (data.addOns && data.addOns.length > 0) {
            const addOnConnections = data.addOns.map(addOnId => ({
                appointmentId: appointment.id,
                addOnId,
            }));
            
            await prisma.appointmentAddOn.createMany({
                data: addOnConnections,
            });
        }
        
        return NextResponse.json({ appointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH to update appointment status (confirm, cancel, complete)
export async function PATCH(request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const data = await request.json();
        
        if (!data.id || !data.status) {
            return NextResponse.json({ error: "Missing appointment ID or status" }, { status: 400 });
        }
        
        const validStatuses = ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"];
        
        if (!validStatuses.includes(data.status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        
        const appointment = await prisma.appointment.update({
            where: { id: data.id },
            data: { status: data.status },
        });
        
        return NextResponse.json({ appointment });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 