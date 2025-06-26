import Stripe from 'stripe';

// Initialize stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a checkout session for an appointment payment
 * 
 * @param {Object} params Checkout parameters
 * @param {string} params.appointmentId The ID of the appointment
 * @param {string} params.serviceName The name of the service
 * @param {number} params.servicePrice The price of the service
 * @param {Array} params.addons Optional array of addon services
 * @param {string} params.customerEmail Customer's email for the receipt
 * @param {string} params.appointmentDate Formatted appointment date
 * @param {string} params.appointmentTime Formatted appointment time
 * @returns {Promise<Stripe.Checkout.Session>} Stripe checkout session
 */
export async function createCheckoutSession({
  appointmentId,
  serviceName,
  servicePrice,
  addons = [],
  customerEmail,
  appointmentDate,
  appointmentTime
}) {
  // Get the domain based on environment
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create line items for the service and addons
  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: serviceName,
          description: `Appointment on ${appointmentDate} at ${appointmentTime}`
        },
        unit_amount: Math.round(servicePrice * 100) // Convert to cents
      },
      quantity: 1
    }
  ];

  // Add each addon as a separate line item
  if (addons && addons.length > 0) {
    addons.forEach(addon => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: addon.name,
            description: addon.description || 'Additional service'
          },
          unit_amount: Math.round(addon.price * 100) // Convert to cents
        },
        quantity: 1
      });
    });
  }

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${domain}/booking/success?session_id={CHECKOUT_SESSION_ID}&appointment=${appointmentId}`,
    cancel_url: `${domain}/booking/cancel?appointment=${appointmentId}`,
    customer_email: customerEmail,
    metadata: {
      appointmentId,
      appointmentDate,
      appointmentTime
    }
  });

  return session;
}

export default stripe; 