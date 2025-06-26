import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

// Get all staff members
export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const staffMembers = await prisma.staff.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        image: true,
                    }
                },
                services: {
                    include: {
                        service: true,
                    }
                },
                schedules: true,
            },
            orderBy: {
                user: {
                    name: 'asc',
                }
            }
        });

        // Get all services for the service selection
        const services = await prisma.service.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            }
        });

        return NextResponse.json({
            staffMembers,
            services
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create a new staff member
export async function POST(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.email || !data.password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if email is already used
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hash(data.password, 12);

        // Create the user and staff profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    phone: data.phone || null,
                    role: "STAFF",
                    image: data.image || null,
                },
            });

            // Create staff profile
            const staff = await tx.staff.create({
                data: {
                    userId: user.id,
                    bio: data.bio || null,
                    imageUrl: data.image || null,
                    isActive: true,
                },
            });

            // Link staff to services if provided
            if (data.services && data.services.length > 0) {
                const serviceConnections = data.services.map(serviceId => ({
                    serviceId,
                    staffId: staff.id,
                }));

                await tx.staffService.createMany({
                    data: serviceConnections,
                });
            }

            return { user, staff };
        });

        return NextResponse.json({
            success: true,
            staff: {
                ...result.staff,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    phone: result.user.phone,
                    role: result.user.role,
                }
            }
        });
    } catch (error) {
        console.error("Error creating staff:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update a staff member
export async function PATCH(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: "Missing staff ID" }, { status: 400 });
        }

        // Get the existing staff record to get the userId
        const existingStaff = await prisma.staff.findUnique({
            where: { id: data.id },
            include: { user: true },
        });

        if (!existingStaff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Start a transaction to update both user and staff
        const result = await prisma.$transaction(async (tx) => {
            // Update user information
            const userUpdateData = {};
            if (data.name) userUpdateData.name = data.name;
            if (data.phone) userUpdateData.phone = data.phone;
            if (data.password) userUpdateData.password = await hash(data.password, 12);

            // Only update user if there's something to update
            let user = existingStaff.user;
            if (Object.keys(userUpdateData).length > 0) {
                user = await tx.user.update({
                    where: { id: existingStaff.userId },
                    data: userUpdateData,
                });
            }

            // Update staff profile
            const staffUpdateData = {};
            if (data.bio !== undefined) staffUpdateData.bio = data.bio;
            if (data.image !== undefined) staffUpdateData.imageUrl = data.image;
            if (data.isActive !== undefined) staffUpdateData.isActive = data.isActive;

            // Only update staff if there's something to update
            let staff = existingStaff;
            if (Object.keys(staffUpdateData).length > 0) {
                staff = await tx.staff.update({
                    where: { id: data.id },
                    data: staffUpdateData,
                });
            }

            // Update service connections if provided
            if (data.services) {
                // First delete existing connections
                await tx.staffService.deleteMany({
                    where: { staffId: data.id },
                });

                // Then create new ones
                if (data.services.length > 0) {
                    const serviceConnections = data.services.map(serviceId => ({
                        serviceId,
                        staffId: data.id,
                    }));

                    await tx.staffService.createMany({
                        data: serviceConnections,
                    });
                }
            }

            return { user, staff };
        });

        return NextResponse.json({
            success: true,
            staff: {
                ...result.staff,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    phone: result.user.phone,
                    role: result.user.role,
                }
            }
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a staff member
export async function DELETE(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing staff ID" }, { status: 400 });
        }

        // Get the staff record to find the associated user
        const staff = await prisma.staff.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Delete the staff record and user in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete staff record first (due to foreign key constraints)
            await tx.staff.delete({
                where: { id },
            });

            // Delete user record
            await tx.user.delete({
                where: { id: staff.userId },
            });
        });

        return NextResponse.json({
            success: true,
            message: "Staff member deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting staff:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 