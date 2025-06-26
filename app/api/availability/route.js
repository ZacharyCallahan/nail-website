import prisma from "@/lib/prisma";
import { getDayOfWeek } from "@/lib/utils";
import { NextResponse } from "next/server";

// Function to check staff availability for a given date
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const serviceId = searchParams.get('serviceId');

        // Basic validation
        if (!date) {
            return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
        }

        if (!serviceId) {
            return NextResponse.json({ error: "Service ID parameter is required" }, { status: 400 });
        }

        // Parse the date
        const selectedDate = new Date(date);
        const dayOfWeek = getDayOfWeek(selectedDate);

        // Setting up date range for the selected date (full day)
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get service details
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                staffServices: {
                    include: {
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Get staff IDs who can perform this service
        const staffIds = service.staffServices.map(ss => ss.staffId);

        // Find availability for this specific date (overrides weekly schedule)
        const specificDateSchedules = await prisma.schedule.findMany({
            where: {
                staffId: { in: staffIds },
                specificDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                isAvailable: true
            },
            include: {
                staff: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        // Staff IDs that have specific date schedules (to exclude them from weekly schedules)
        const staffWithSpecificSchedule = specificDateSchedules.map(schedule => schedule.staffId);

        // Find weekly recurring availability for the selected day of week 
        // (only for staff that don't have a specific schedule for this date)
        const weeklySchedules = await prisma.schedule.findMany({
            where: {
                staffId: {
                    in: staffIds,
                    notIn: staffWithSpecificSchedule // Exclude staff with specific date schedules
                },
                dayOfWeek: dayOfWeek,
                specificDate: null, // Only get weekly recurring schedules
                isAvailable: true
            },
            include: {
                staff: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        // Combine both types of schedules
        const allSchedules = [...specificDateSchedules, ...weeklySchedules];

        // Get existing appointments for the selected date
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                staffId: { in: staffIds },
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    notIn: ['CANCELED']
                }
            },
            select: {
                staffId: true,
                startTime: true,
                endTime: true
            }
        });

        // Generate available time slots
        const availabilityByStaff = {};

        for (const schedule of allSchedules) {
            const staffId = schedule.staffId;
            const staffName = schedule.staff.user.name;
            const startHour = new Date(schedule.startTime).getHours();
            const startMinute = new Date(schedule.startTime).getMinutes();
            const endHour = new Date(schedule.endTime).getHours();
            const endMinute = new Date(schedule.endTime).getMinutes();

            // Filter appointments for this staff member
            const staffAppointments = existingAppointments
                .filter(app => app.staffId === staffId);

            // Generate time slots at 30-minute intervals
            const slots = [];

            // Set up starting time
            const slotTime = new Date(selectedDate);
            slotTime.setHours(startHour, startMinute, 0, 0);

            // End time to compare against
            const endTime = new Date(selectedDate);
            endTime.setHours(endHour, endMinute, 0, 0);

            // Service duration in milliseconds
            const serviceDuration = service.duration * 60 * 1000;

            // Generate slots until we reach the end time
            while (slotTime < endTime) {
                const slotEndTime = new Date(slotTime.getTime() + serviceDuration);

                // Skip if this slot would end after the staff member's schedule
                if (slotEndTime > endTime) {
                    break;
                }

                // Check if this slot overlaps with any existing appointment
                const isBooked = staffAppointments.some(app => {
                    const appointmentStart = new Date(app.startTime);
                    const appointmentEnd = new Date(app.endTime);

                    // Check for overlap
                    return (
                        (slotTime >= appointmentStart && slotTime < appointmentEnd) || // slot start during appointment
                        (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) || // slot end during appointment
                        (slotTime <= appointmentStart && slotEndTime >= appointmentEnd) // slot contains appointment
                    );
                });

                if (!isBooked) {
                    slots.push({
                        time: slotTime.toISOString(),
                        endTime: slotEndTime.toISOString()
                    });
                }

                // Move to the next slot (30 minute increments)
                slotTime.setMinutes(slotTime.getMinutes() + 30);
            }

            // Only add staff member if they have available slots
            if (slots.length > 0) {
                availabilityByStaff[staffId] = {
                    id: staffId,
                    name: staffName,
                    image: schedule.staff.user.image,
                    slots
                };
            }
        }

        // Convert to array for easier frontend handling
        const availability = Object.values(availabilityByStaff);

        return NextResponse.json({ availability });
    } catch (error) {
        console.error("Error checking availability:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 