import prisma from '@/lib/prisma';
import { addDays, format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        console.log("Availability dates API called with serviceId:", serviceId);

        if (!serviceId) {
            console.error("Missing required parameter: serviceId");
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

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
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!service) {
            console.error("Service not found:", serviceId);
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Get staff IDs who can perform this service
        const staffIds = service.staffServices.map(ss => ss.staffId);
        console.log("Staff who can perform this service:", staffIds);

        if (staffIds.length === 0) {
            console.error("No staff members can perform this service");
            return NextResponse.json({ availableDates: [] });
        }

        // Get all schedules for these staff members
        const schedules = await prisma.schedule.findMany({
            where: {
                staffId: { in: staffIds },
                isAvailable: true
            },
            orderBy: {
                specificDate: 'asc'
            }
        });

        console.log(`Found ${schedules.length} schedules`);

        // Extract all available dates
        const availableDates = new Set();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = addDays(today, 30); // Only consider next 30 days

        // Process specific dates
        schedules.forEach(schedule => {
            if (schedule.specificDate) {
                const scheduleDate = new Date(schedule.specificDate);

                // Only include dates that are today or in the future, and within 30 days
                if (scheduleDate >= today && scheduleDate <= maxDate) {
                    availableDates.add(format(scheduleDate, 'yyyy-MM-dd'));
                }
            }
        });

        // Process weekly schedules (recurring)
        const weeklySchedules = schedules.filter(s => s.dayOfWeek !== null && s.specificDate === null);

        // For each day in the next 30 days, check if there's a weekly schedule
        for (let i = 0; i <= 30; i++) {
            const date = addDays(today, i);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Check if any staff member has availability on this day of week
            const hasWeeklyAvailability = weeklySchedules.some(schedule => schedule.dayOfWeek === dayOfWeek);

            if (hasWeeklyAvailability) {
                availableDates.add(format(date, 'yyyy-MM-dd'));
            }
        }

        // Convert Set to Array
        const availableDatesArray = Array.from(availableDates);
        console.log(`Returning ${availableDatesArray.length} available dates`);

        return NextResponse.json({ availableDates: availableDatesArray });
    } catch (error) {
        console.error('Error fetching available dates:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 