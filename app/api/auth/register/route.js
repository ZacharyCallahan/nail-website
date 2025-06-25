import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';

export async function POST(request) {
    try {
        const { name, email, phone, password } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return Response.json({ message: 'User already exists with this email' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'CUSTOMER',
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return Response.json(
            {
                message: 'User registered successfully',
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            { message: 'An error occurred during registration' },
            { status: 500 }
        );
    }
} 