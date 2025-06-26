import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all staff availability schedules
export async function GET(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staffId');

        const whereClause = staffId ? { staffId } : {};

        const schedules = await prisma.schedule.findMany({
            where: whereClause,
            include: {
                staff: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            }
                        }
                    }
                }
            },
            orderBy: [
                { staffId: 'asc' },
                { specificDate: 'asc' },
                { dayOfWeek: 'asc' }
            ]
        });

        // Also get the staff members for the dropdown
        const staffMembers = await prisma.staff.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json({
            schedules,
            staffMembers
        });
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Add new staff availability
export async function POST(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.staffId || !data.startTime || !data.endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check availability type (weekly or specific date)
        const isWeekly = data.type === "weekly";
        const isSpecific = data.type === "specific";

        if (isWeekly && (!data.days || data.days.length === 0)) {
            return NextResponse.json({ error: "Day selection is required for weekly availability" }, { status: 400 });
        }

        if (isSpecific && !data.specificDate) {
            return NextResponse.json({ error: "Specific date is required for date-based availability" }, { status: 400 });
        }

        let scheduleEntries = [];

        if (isWeekly) {
            // Create a schedule entry for each selected day in weekly recurrence
            scheduleEntries = await Promise.all(
                data.days.map(async (day) => {
                    // First check if there's already an entry for this staff member and day
                    const existingSchedule = await prisma.schedule.findFirst({
                        where: {
                            staffId: data.staffId,
                            dayOfWeek: day,
                            specificDate: null // Make sure we're only looking at weekly schedules
                        }
                    });

                    // If exists, update it
                    if (existingSchedule) {
                        return prisma.schedule.update({
                            where: { id: existingSchedule.id },
                            data: {
                                startTime: new Date(`2023-01-01T${data.startTime}:00`),
                                endTime: new Date(`2023-01-01T${data.endTime}:00`),
                                isAvailable: true,
                            }
                        });
                    }

                    // If doesn't exist, create it
                    return prisma.schedule.create({
                        data: {
                            staffId: data.staffId,
                            dayOfWeek: day,
                            specificDate: null,
                            startTime: new Date(`2023-01-01T${data.startTime}:00`),
                            endTime: new Date(`2023-01-01T${data.endTime}:00`),
                            isAvailable: true
                        }
                    });
                })
            );
        } else if (isSpecific) {
            // Process specific date availability
            const specificDate = new Date(data.specificDate);

            // Check if there's an existing entry for this date
            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    staffId: data.staffId,
                    specificDate: {
                        gte: new Date(specificDate.setHours(0, 0, 0, 0)),
                        lt: new Date(new Date(specificDate).setHours(23, 59, 59, 999))
                    }
                }
            });

            if (existingSchedule) {
                // Update the existing schedule
                const updatedSchedule = await prisma.schedule.update({
                    where: { id: existingSchedule.id },
                    data: {
                        startTime: new Date(`2023-01-01T${data.startTime}:00`),
                        endTime: new Date(`2023-01-01T${data.endTime}:00`),
                        isAvailable: true
                    }
                });
                scheduleEntries = [updatedSchedule];
            } else {
                // Create a new specific date schedule
                const newSchedule = await prisma.schedule.create({
                    data: {
                        staffId: data.staffId,
                        dayOfWeek: null,
                        specificDate: new Date(data.specificDate),
                        startTime: new Date(`2023-01-01T${data.startTime}:00`),
                        endTime: new Date(`2023-01-01T${data.endTime}:00`),
                        isAvailable: true
                    }
                });
                scheduleEntries = [newSchedule];
            }
        }

        return NextResponse.json({
            success: true,
            schedules: scheduleEntries
        });
    } catch (error) {
        console.error("Error creating availability:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update or delete a specific schedule
export async function PATCH(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
        }

        let schedule;

        // Delete the schedule if isDelete is true
        if (data.isDelete) {
            schedule = await prisma.schedule.delete({
                where: { id: data.id }
            });

            return NextResponse.json({
                success: true,
                message: "Schedule deleted successfully"
            });
        }

        // Otherwise update the schedule
        schedule = await prisma.schedule.update({
            where: { id: data.id },
            data: {
                startTime: data.startTime ? new Date(`2023-01-01T${data.startTime}:00`) : undefined,
                endTime: data.endTime ? new Date(`2023-01-01T${data.endTime}:00`) : undefined,
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined,
                dayOfWeek: data.dayOfWeek !== undefined ? data.dayOfWeek : undefined,
                specificDate: data.specificDate ? new Date(data.specificDate) : undefined
            }
        });

        return NextResponse.json({ success: true, schedule });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 