/**
 * This is a helper script to remind developers how to start the Stripe webhook CLI
 * Run it with: node scripts/stripe-webhook.js
 */

console.log('\x1b[33m%s\x1b[0m', '⚠️ Stripe Webhook CLI Instructions');
console.log('\x1b[36m%s\x1b[0m', 'Make sure you have the Stripe CLI installed: https://stripe.com/docs/stripe-cli');
console.log('\x1b[36m%s\x1b[0m', 'Then run the following command:');
console.log('\x1b[32m%s\x1b[0m', 'stripe listen --forward-to http://localhost:3000/api/webhook');
console.log('\x1b[36m%s\x1b[0m', 'Copy the webhook signing secret and add it to your .env file:');
console.log('\x1b[32m%s\x1b[0m', 'STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('\x1b[36m%s\x1b[0m', 'Keep the CLI running in a separate terminal while working with Stripe payments.'); 