const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a random string for NEXTAUTH_SECRET
const generateSecret = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Path to .env file
const envPath = path.join(process.cwd(), '.env');

// Check if .env file exists
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('⚠️ .env file already exists. Skipping creation to avoid overwriting existing configuration.');
    console.log('If you want to recreate it, please delete the existing .env file first.');
    process.exit(0);
}

// Create .env file with default values
const envContent = `# Database connection string for PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nail_website"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecret()}

# Stripe API Keys (replace with your actual keys)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# App URL (used for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully with default values and a secure random NEXTAUTH_SECRET.');
    console.log('⚠️ Remember to update the Stripe API keys with your actual values.');
} catch (error) {
    console.error('❌ Error creating .env file:', error);
    process.exit(1);
} 