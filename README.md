# Elegant Nails - Nail Salon Website

A modern, responsive website for a nail salon built with Next.js 15, Tailwind CSS, and Prisma.

## Features

- Responsive design for all devices
- Online booking system
- User authentication and profiles
- Admin dashboard for appointment management
- Staff availability management
- Gallery with service showcases
- Contact form
- Stripe payment integration
- Dark/light mode support

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Styling**: Tailwind CSS with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nail-website.git
   cd nail-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   npm run setup-env
   ```
   This will create a `.env` file with default values. Update it with your actual database connection string and Stripe API keys.

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database with initial data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Default Admin Login

After running the seed script, you can log in with the following admin credentials:

- Email: admin@example.com
- Password: admin123

## Project Structure

- `app/` - Next.js app directory with pages and components
- `app/api/` - API routes
- `app/components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets
- `scripts/` - Utility scripts

## License

This project is licensed under the MIT License - see the LICENSE file for details.
