import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createCheckoutSession, stripe } from "@/lib/stripe";
import { calculateEndTime } from "@/lib/utils";
import { NextResponse } from "next/server";

// Create a new booking
export async function POST(request) {
    try {
        const session = await auth();

        // Get request body
        const data = await request.json();
        const {
            serviceId,
            staffId,
            date,
            time,
            customer,
            addons = []
        } = data;

        if (!serviceId || !staffId || !date || !time || !customer) {
            return NextResponse.json(
                { error: "Missing required booking information" },
                { status: 400 }
            );
        }

        // Validate customer data
        if (!customer.name || !customer.email || !customer.phone) {
            return NextResponse.json(
                { error: "Missing customer information" },
                { status: 400 }
            );
        }

        // Get the service details
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                addons: {
                    where: {
                        id: {
                            in: addons
                        }
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        // Check staff exists and can perform this service
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                isActive: true,
                services: {
                    some: {
                        id: serviceId
                    }
                }
            }
        });

        if (!staff) {
            return NextResponse.json(
                { error: "Staff member not found or cannot perform this service" },
                { status: 404 }
            );
        }

        // Convert date and time to Date objects
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);

        dateObj.setHours(hours, minutes, 0, 0);

        // Calculate end time based on service duration
        const durationInMinutes = service.duration;
        const endTimeObj = new Date(dateObj);
        endTimeObj.setMinutes(dateObj.getMinutes() + durationInMinutes);

        // Check if the staff is available at this time
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Format date range for specific date check
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);

        // Check for specific date schedule first (it overrides weekly schedule)
        const specificDateSchedule = await prisma.schedule.findFirst({
            where: {
                staffId,
                specificDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        // If no specific schedule, check weekly schedule
        let schedule = specificDateSchedule;
        if (!schedule) {
            schedule = await prisma.schedule.findFirst({
                where: {
                    staffId,
                    dayOfWeek,
                    specificDate: null
                }
            });
        }

        if (!schedule || !schedule.isAvailable) {
            return NextResponse.json(
                { error: "Staff member is not available on this day" },
                { status: 400 }
            );
        }

        // Check if the requested time is within the staff's schedule
        const scheduleStartTime = new Date(schedule.startTime);
        const scheduleEndTime = new Date(schedule.endTime);

        // Extract just the time part for comparison
        const requestedTimeHours = dateObj.getHours();
        const requestedTimeMinutes = dateObj.getMinutes();

        const scheduleStartTimeHours = scheduleStartTime.getHours();
        const scheduleStartTimeMinutes = scheduleStartTime.getMinutes();

        const scheduleEndTimeHours = scheduleEndTime.getHours();
        const scheduleEndTimeMinutes = scheduleEndTime.getMinutes();

        // Convert to minutes for easier comparison
        const requestedTimeInMinutes = requestedTimeHours * 60 + requestedTimeMinutes;
        const scheduleStartInMinutes = scheduleStartTimeHours * 60 + scheduleStartTimeMinutes;
        const scheduleEndInMinutes = scheduleEndTimeHours * 60 + scheduleEndTimeMinutes;

        if (requestedTimeInMinutes < scheduleStartInMinutes ||
            requestedTimeInMinutes + durationInMinutes > scheduleEndInMinutes) {
            return NextResponse.json(
                { error: "Requested time is outside of staff availability hours" },
                { status: 400 }
            );
        }

        // Check for any conflicting appointments
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                staffId,
                status: {
                    notIn: ['CANCELED']
                },
                OR: [
                    // Appointment starts during our requested time slot
                    {
                        startTime: {
                            gte: dateObj,
                            lt: endTimeObj
                        }
                    },
                    // Appointment ends during our requested time slot
                    {
                        endTime: {
                            gt: dateObj,
                            lte: endTimeObj
                        }
                    },
                    // Appointment completely contains our requested time slot
                    {
                        startTime: {
                            lte: dateObj
                        },
                        endTime: {
                            gte: endTimeObj
                        }
                    }
                ]
            }
        });

        if (conflictingAppointment) {
            return NextResponse.json(
                { error: "This time slot is no longer available" },
                { status: 400 }
            );
        }

        // Calculate total price
        const addonTotal = service.addons.reduce((sum, addon) => sum + addon.price, 0);
        const totalPrice = service.price + addonTotal;

        // Create the appointment in "pending" status
        const appointment = await prisma.appointment.create({
            data: {
                serviceId,
                staffId,
                startTime: dateObj,
                endTime: endTimeObj,
                status: 'PENDING',
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                notes: customer.notes || '',
                totalPrice,
                addons: {
                    connect: service.addons.map(addon => ({ id: addon.id }))
                },
                // If the user is authenticated, link the appointment to their account
                ...(session?.user ? {
                    userId: session.user.id
                } : {})
            }
        });

        // Create a Stripe checkout session
        const checkoutSession = await createCheckoutSession({
            appointmentId: appointment.id,
            serviceName: service.name,
            servicePrice: service.price,
            addons: service.addons,
            customerEmail: customer.email,
            appointmentDate: dateObj.toLocaleDateString(),
            appointmentTime: `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`
        });

        return NextResponse.json({
            success: true,
            appointment: {
                id: appointment.id,
                service: service.name,
                date: dateObj.toLocaleDateString(),
                time: `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`,
                customer: customer.name
            },
            checkoutUrl: checkoutSession.url
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create booking' },
            { status: 500 }
        );
    }
} 