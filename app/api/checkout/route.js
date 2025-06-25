import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { constructLineItem, createCheckoutSession } from '@/lib/stripe';
import { getServerSession } from 'next-auth/next';

export async function POST(request) {
    try {
        // Verify that the user is authenticated
        const session = await getServerSession(authOptions);

        if (!session) {
            return Response.json({ error: 'You must be logged in to book an appointment' }, { status: 401 });
        }

        const { appointmentDetails, serviceId, addOnIds = [] } = await request.json();

        if (!serviceId) {
            return Response.json({ error: 'Service ID is required' }, { status: 400 });
        }

        // Get the service data
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return Response.json({ error: 'Service not found' }, { status: 404 });
        }

        // Get the add-on data if any
        const addOns = addOnIds.length > 0
            ? await prisma.addOn.findMany({
                where: { id: { in: addOnIds } },
            })
            : [];

        // Create line items for Stripe checkout
        const lineItems = [
            constructLineItem(service),
            ...addOns.map(addOn => constructLineItem(addOn)),
        ];

        // Calculate the total price
        const totalPrice = parseFloat(service.price) +
            addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);

        // Create metadata for the checkout session
        const metadata = {
            customerId: session.user.id,
            serviceId: service.id,
            addOnIds: addOnIds.join(','),
            appointmentDate: appointmentDetails.date,
            appointmentTime: appointmentDetails.time,
            staffId: appointmentDetails.staffId,
        };

        // Create a Stripe checkout session
        const checkoutSession = await createCheckoutSession({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
            customer_email: session.user.email,
            metadata,
        });

        // Return the checkout URL
        return Response.json({ url: checkoutSession.url }, { status: 200 });
    } catch (error) {
        console.error('Checkout API error:', error);
        return Response.json({ error: 'An error occurred during checkout' }, { status: 500 });
    }
} 