import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all services with add-ons
export async function GET(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get services with their add-ons
        const services = await prisma.service.findMany({
            include: {
                addOns: true,
                staffServices: {
                    include: {
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({
            services
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create a new service
export async function POST(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.price || !data.duration || !data.category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the service
        const service = await prisma.service.create({
            data: {
                name: data.name,
                description: data.description || "",
                price: data.price,
                duration: data.duration,
                category: data.category,
                imageUrl: data.imageUrl || null,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });

        return NextResponse.json({
            success: true,
            service: {
                ...service,
                addOns: [], // Initialize with empty add-ons array
            }
        });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update an existing service
export async function PATCH(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
        }

        // Get existing service to include add-ons in response
        const existingService = await prisma.service.findUnique({
            where: { id: data.id },
            include: {
                addOns: true,
            },
        });

        if (!existingService) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Update the service
        const updatedService = await prisma.service.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description || "",
                price: data.price,
                duration: data.duration,
                category: data.category,
                imageUrl: data.imageUrl || null,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
            include: {
                addOns: true,
                staffServices: {
                    include: {
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            service: updatedService
        });
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a service
export async function DELETE(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
        }

        // First check if there are any appointments using this service
        const hasAppointments = await prisma.appointment.findFirst({
            where: {
                serviceId: id,
                status: {
                    notIn: ['CANCELED']
                }
            }
        });

        if (hasAppointments) {
            return NextResponse.json({
                error: "Cannot delete service that has appointments. Consider marking it as inactive instead."
            }, { status: 400 });
        }

        // Delete in a transaction to ensure integrity
        await prisma.$transaction(async (tx) => {
            // Delete all add-ons for this service
            await tx.addOn.deleteMany({
                where: { serviceId: id },
            });

            // Delete staff-service connections
            await tx.staffService.deleteMany({
                where: { serviceId: id },
            });

            // Delete the service itself
            await tx.service.delete({
                where: { id },
            });
        });

        return NextResponse.json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 