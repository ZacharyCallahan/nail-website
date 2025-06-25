import { Stripe } from 'stripe';

let stripeInstance = null;

/**
 * Initialize and return the Stripe instance
 */
export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      appInfo: {
        name: 'Elegant Nails Booking',
        version: '0.1.0',
      },
    });
  }
  return stripeInstance;
}

/**
 * Get the Stripe public key for client-side usage
 */
export function getStripePublicKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  const stripe = getStripe();
  
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(params) {
  const {
    line_items,
    success_url,
    cancel_url,
    customer_email,
    metadata,
    mode = 'payment',
  } = params;
  
  const stripe = getStripe();
  
  return stripe.checkout.sessions.create({
    line_items,
    mode,
    success_url,
    cancel_url,
    customer_email,
    metadata,
  });
}

/**
 * Retrieve a Stripe checkout session by ID
 */
export async function getCheckoutSession(sessionId) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Construct a product object for Stripe checkout
 */
export function constructLineItem(service) {
  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: service.name,
        description: service.description,
        images: service.imageUrl ? [service.imageUrl] : [],
      },
      unit_amount: Math.round(Number(service.price) * 100), // Convert to cents
    },
    quantity: 1,
  };
} 