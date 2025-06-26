import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Create a new add-on
export async function POST(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.price === undefined || !data.serviceId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if service exists
        const service = await prisma.service.findUnique({
            where: { id: data.serviceId }
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Create the add-on
        const addon = await prisma.addOn.create({
            data: {
                name: data.name,
                description: data.description || "",
                price: data.price,
                serviceId: data.serviceId,
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });

        return NextResponse.json({
            success: true,
            addon
        });
    } catch (error) {
        console.error("Error creating add-on:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update an existing add-on
export async function PATCH(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: "Missing add-on ID" }, { status: 400 });
        }

        // Check if add-on exists
        const existingAddon = await prisma.addOn.findUnique({
            where: { id: data.id }
        });

        if (!existingAddon) {
            return NextResponse.json({ error: "Add-on not found" }, { status: 404 });
        }

        // Update the add-on
        const updatedAddon = await prisma.addOn.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description || "",
                price: data.price,
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });

        return NextResponse.json({
            success: true,
            addon: updatedAddon
        });
    } catch (error) {
        console.error("Error updating add-on:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete an add-on
export async function DELETE(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing add-on ID" }, { status: 400 });
        }

        // First check if there are any appointments using this add-on
        const hasAppointments = await prisma.appointmentAddOn.findFirst({
            where: {
                addOnId: id,
                appointment: {
                    status: {
                        notIn: ['CANCELED']
                    }
                }
            }
        });

        if (hasAppointments) {
            return NextResponse.json({
                error: "Cannot delete add-on that is used in appointments. Consider marking it as inactive instead."
            }, { status: 400 });
        }

        // Delete the add-on
        await prisma.addOn.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Add-on deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting add-on:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 