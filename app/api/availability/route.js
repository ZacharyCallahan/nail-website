import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Simple in-memory cache for availability data (in a production environment, use Redis)
const availabilityCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const staffId = searchParams.get('staffId');
        const serviceId = searchParams.get('serviceId');

        console.log("Availability API called with:", { date, staffId, serviceId });

        if (!date) {
            console.error("Missing required parameter: date");
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        if (!serviceId) {
            console.error("Missing required parameter: serviceId");
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        // Generate a cache key based on parameters
        const cacheKey = `availability-${date}-${serviceId}-${staffId || 'all'}`;

        // Check if we have cached data
        if (availabilityCache.has(cacheKey)) {
            const cachedData = availabilityCache.get(cacheKey);
            if (cachedData.timestamp > Date.now() - CACHE_TTL) {
                console.log("Returning cached availability data");
                return NextResponse.json(cachedData.data);
            } else {
                // Remove expired cache entry
                availabilityCache.delete(cacheKey);
            }
        }

        const selectedDate = new Date(date);
        if (isNaN(selectedDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        console.log("Processing for date:", selectedDate, "day of week:", dayOfWeek);

        // Format the date to match the date part only (for comparing with specificDate)
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get service details with efficient query
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                name: true,
                duration: true,
                staffServices: {
                    select: {
                        staffId: true,
                        staff: {
                            select: {
                                id: true,
                                userId: true,
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
            console.error("Service not found:", serviceId);
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        console.log("Service found:", service.name, "duration:", service.duration);

        // Get staff IDs who can perform this service
        const staffIds = service.staffServices.map(ss => ss.staffId);
        console.log("Staff who can perform this service:", staffIds);

        if (staffIds.length === 0) {
            console.error("No staff members can perform this service");
            return NextResponse.json({ availability: [] });
        }

        // Build the query for schedules
        const whereClause = {
            staffId: { in: staffIds },
            OR: [
                // Regular weekly schedule
                {
                    dayOfWeek: dayOfWeek,
                    specificDate: null,
                    isAvailable: true
                },
                // Specific date availability that overrides weekly schedule
                {
                    specificDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    isAvailable: true
                }
            ]
        };

        // Add staff filter if staffId is provided
        if (staffId) {
            whereClause.staffId = staffId;
        }

        // Get all schedules for this date (both weekly and specific)
        // Optimize the query by selecting only needed fields
        const schedules = await prisma.schedule.findMany({
            where: whereClause,
            select: {
                id: true,
                staffId: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                specificDate: true,
                staff: {
                    select: {
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

        console.log("Found schedules:", schedules.length);

        if (schedules.length === 0) {
            console.log("No schedules found for the selected date and staff");
            const emptyResult = { availability: [] };

            // Cache empty result
            availabilityCache.set(cacheKey, {
                timestamp: Date.now(),
                data: emptyResult
            });

            return NextResponse.json(emptyResult);
        }

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

        console.log("Existing appointments:", existingAppointments.length);

        // Generate available time slots
        const availabilityByStaff = {};

        for (const schedule of schedules) {
            const staffId = schedule.staffId;
            const staffName = schedule.staff.user.name;
            const staffImage = schedule.staff.user.image;

            // Format time values correctly
            const startTime = new Date(schedule.startTime);
            const endTime = new Date(schedule.endTime);

            // Skip invalid times
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                console.error("Invalid time for staff", staffId, "schedule", schedule.id);
                continue;
            }

            // Filter appointments for this staff member
            const staffAppointments = existingAppointments
                .filter(app => app.staffId === staffId);

            // Generate time slots at 30-minute intervals
            const slots = [];

            // Set up starting time
            const slotTime = new Date(selectedDate);
            slotTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

            // Service duration in milliseconds
            const serviceDuration = service.duration * 60 * 1000;

            // Generate slots until we reach the end time
            const slotEndTime = new Date(selectedDate);
            slotEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

            while (slotTime < slotEndTime) {
                const slotEnd = new Date(slotTime.getTime() + serviceDuration);

                // Skip if this slot would end after the staff member's schedule
                if (slotEnd > slotEndTime) {
                    break;
                }

                // Check if this slot overlaps with any existing appointment
                const isBooked = staffAppointments.some(app => {
                    const appointmentStart = new Date(app.startTime);
                    const appointmentEnd = new Date(app.endTime);

                    // Check for overlap
                    return (
                        (slotTime >= appointmentStart && slotTime < appointmentEnd) || // slot start during appointment
                        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) || // slot end during appointment
                        (slotTime <= appointmentStart && slotEnd >= appointmentEnd) // slot contains appointment
                    );
                });

                if (!isBooked) {
                    slots.push({
                        time: slotTime.toISOString(),
                        endTime: slotEnd.toISOString()
                    });
                }

                // Move to the next slot (30 minute increments)
                slotTime.setMinutes(slotTime.getMinutes() + 30);
            }

            // Only add staff member if they have available slots
            if (slots.length > 0) {
                if (!availabilityByStaff[staffId]) {
                    availabilityByStaff[staffId] = {
                        id: staffId,
                        name: staffName,
                        image: staffImage,
                        slots: []
                    };
                }

                // Add slots to this staff member
                availabilityByStaff[staffId].slots = [
                    ...availabilityByStaff[staffId].slots,
                    ...slots
                ];
            }
        }

        // Convert to array for easier frontend handling
        const availability = Object.values(availabilityByStaff);

        const result = { availability };

        // Store in cache
        availabilityCache.set(cacheKey, {
            timestamp: Date.now(),
            data: result
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 