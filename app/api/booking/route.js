import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calculateEndTime } from "@/lib/utils";
import { NextResponse } from "next/server";

// Create a new booking
export async function POST(request) {
    try {
        const session = await auth();
        const data = await request.json();

        // Validate required fields
        if (!data.serviceId || !data.staffId || !data.startTime || !data.totalPrice) {
            return NextResponse.json({ error: "Missing required booking information" }, { status: 400 });
        }

        // Get the service to calculate end time
        const service = await prisma.service.findUnique({
            where: { id: data.serviceId }
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Calculate end time based on service duration
        const startTime = new Date(data.startTime);
        const endTime = calculateEndTime(startTime, service.duration);

        // Check if the customer already exists by email
        let customerId = null;

        if (session && session.user) {
            // If user is logged in, use their ID
            customerId = session.user.id;
        } else if (data.customerEmail) {
            // If not logged in, check if customer exists by email
            const existingCustomer = await prisma.user.findUnique({
                where: { email: data.customerEmail }
            });

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                // Create a new customer
                const newCustomer = await prisma.user.create({
                    data: {
                        name: `${data.customerFirstName} ${data.customerLastName}`,
                        email: data.customerEmail,
                        phone: data.customerPhone,
                        role: "CUSTOMER"
                    }
                });

                customerId = newCustomer.id;
            }
        } else {
            return NextResponse.json({ error: "Customer information required" }, { status: 400 });
        }

        // Verify this time slot is available
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                staffId: data.staffId,
                status: { notIn: ["CANCELED"] },
                OR: [
                    {
                        startTime: { lte: startTime },
                        endTime: { gt: startTime }
                    },
                    {
                        startTime: { lt: endTime },
                        endTime: { gte: endTime }
                    },
                    {
                        startTime: { gte: startTime },
                        endTime: { lte: endTime }
                    }
                ]
            }
        });

        if (conflictingAppointment) {
            return NextResponse.json({
                error: "This time slot is no longer available. Please select a different time."
            }, { status: 409 });
        }

        // Create the booking in a transaction
        const appointment = await prisma.$transaction(async (tx) => {
            // Create the appointment
            const newAppointment = await tx.appointment.create({
                data: {
                    customerId,
                    staffId: data.staffId,
                    serviceId: data.serviceId,
                    startTime,
                    endTime,
                    status: "PENDING",
                    totalPrice: parseFloat(data.totalPrice),
                    notes: data.notes || null
                }
            });

            // Add any add-ons
            if (data.addOns && data.addOns.length > 0) {
                const addOnConnections = data.addOns.map(addOnId => ({
                    appointmentId: newAppointment.id,
                    addOnId
                }));

                await tx.appointmentAddOn.createMany({
                    data: addOnConnections
                });
            }

            // Create a pending payment record
            await tx.payment.create({
                data: {
                    appointmentId: newAppointment.id,
                    amount: parseFloat(data.totalPrice),
                    status: "PENDING"
                }
            });

            return newAppointment;
        });

        // Create a Stripe checkout session
        const stripeDomain = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_APP_URL
            : 'http://localhost:3000';

        // Create line items for the service and add-ons
        const lineItems = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: service.name,
                        description: `${service.duration} min appointment`
                    },
                    unit_amount: Math.round(parseFloat(data.totalPrice) * 100) // Convert to cents
                },
                quantity: 1
            }
        ];

        const checkoutSession = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${stripeDomain}/booking/success?appointmentId=${appointment.id}`,
            cancel_url: `${stripeDomain}/booking/cancel?appointmentId=${appointment.id}`,
            client_reference_id: appointment.id,
            customer_email: data.customerEmail,
            metadata: {
                appointmentId: appointment.id,
                serviceId: data.serviceId,
                staffId: data.staffId,
                customerId
            }
        });

        return NextResponse.json({
            success: true,
            appointmentId: appointment.id,
            checkoutUrl: checkoutSession.url
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 