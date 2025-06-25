import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Create the appointment in the database based on the metadata
        if (session.metadata) {
          const {
            customerId,
            serviceId,
            staffId,
            appointmentDate,
            appointmentTime,
            addOnIds,
          } = session.metadata;

          // Parse the date and time to create start and end time
          const [year, month, day] = appointmentDate.split('-').map(Number);
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          
          const startTime = new Date(year, month - 1, day, hours, minutes);

          // Get service to determine duration
          const service = await prisma.service.findUnique({
            where: { id: serviceId },
          });

          if (!service) {
            throw new Error('Service not found');
          }

          // Calculate end time based on service duration
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + service.duration);

          // Calculate total price
          const addOnIdsArray = addOnIds ? addOnIds.split(',').filter(Boolean) : [];
          
          let totalPrice = parseFloat(service.price);
          
          if (addOnIdsArray.length > 0) {
            const addOns = await prisma.addOn.findMany({
              where: { id: { in: addOnIdsArray } },
            });
            
            totalPrice += addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
          }

          // Create the appointment
          const appointment = await prisma.appointment.create({
            data: {
              customerId,
              staffId,
              serviceId,
              startTime,
              endTime,
              status: 'CONFIRMED',
              totalPrice,
              addOns: {
                create: addOnIdsArray.map(addOnId => ({
                  addOn: { connect: { id: addOnId } },
                })),
              },
              payment: {
                create: {
                  amount: totalPrice,
                  stripePaymentId: session.payment_intent,
                  status: 'COMPLETED',
                },
              },
              notifications: {
                create: {
                  type: 'EMAIL',
                  status: 'PENDING',
                },
              },
            },
          });
          
          // TODO: Send email confirmation to the customer
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        // Update payment status if needed
        const paymentIntent = event.data.object;
        
        // Find the payment with this intent ID
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        });
        
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        // Handle failed payment
        const paymentIntent = event.data.object;
        
        // Find the payment with this intent ID
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        });
        
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          
          // Update appointment status
          await prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CANCELED' },
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }
} 