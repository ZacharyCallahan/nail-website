const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log('Created admin user:', admin.email);

    // Create staff users
    const staffPassword = await hash('staff123', 12);
    const staff1 = await prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            password: staffPassword,
            role: 'STAFF',
            phone: '555-123-4567',
        },
    });

    const staff2 = await prisma.user.upsert({
        where: { email: 'michael@example.com' },
        update: {},
        create: {
            name: 'Michael Chen',
            email: 'michael@example.com',
            password: staffPassword,
            role: 'STAFF',
            phone: '555-987-6543',
        },
    });

    const staff3 = await prisma.user.upsert({
        where: { email: 'jessica@example.com' },
        update: {},
        create: {
            name: 'Jessica Lee',
            email: 'jessica@example.com',
            password: staffPassword,
            role: 'STAFF',
            phone: '555-456-7890',
        },
    });

    console.log('Created staff users');

    // Create staff profiles
    const staffProfile1 = await prisma.staff.upsert({
        where: { userId: staff1.id },
        update: {},
        create: {
            userId: staff1.id,
            bio: 'With over 15 years of experience, Sarah founded Elegant Nails with a vision to provide premium nail care in a relaxing environment.',
            isActive: true,
        },
    });

    const staffProfile2 = await prisma.staff.upsert({
        where: { userId: staff2.id },
        update: {},
        create: {
            userId: staff2.id,
            bio: 'Michael is known for his intricate nail art designs and attention to detail. He specializes in 3D nail art and hand-painted designs.',
            isActive: true,
        },
    });

    const staffProfile3 = await prisma.staff.upsert({
        where: { userId: staff3.id },
        update: {},
        create: {
            userId: staff3.id,
            bio: 'Jessica specializes in natural nail care and pedicures. Her gentle approach and precision make her a client favorite.',
            isActive: true,
        },
    });

    console.log('Created staff profiles');

    // Create services
    const service1 = await prisma.service.upsert({
        where: { id: 'service1' },
        update: {},
        create: {
            id: 'service1',
            name: 'Classic Manicure',
            description: 'A traditional manicure including nail shaping, cuticle care, hand massage, and polish application.',
            duration: 30,
            price: 25.00,
            category: 'Manicure',
            imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=500&h=500&auto=format&fit=crop',
            isActive: true,
        },
    });

    const service2 = await prisma.service.upsert({
        where: { id: 'service2' },
        update: {},
        create: {
            id: 'service2',
            name: 'Gel Manicure',
            description: 'Long-lasting gel polish application with nail shaping and cuticle care. Cured under UV light for a durable finish.',
            duration: 45,
            price: 35.00,
            category: 'Manicure',
            imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=500&h=500&auto=format&fit=crop',
            isActive: true,
        },
    });

    const service3 = await prisma.service.upsert({
        where: { id: 'service3' },
        update: {},
        create: {
            id: 'service3',
            name: 'Deluxe Pedicure',
            description: 'Luxurious foot treatment including exfoliation, callus removal, extended massage, and polish application.',
            duration: 60,
            price: 45.00,
            category: 'Pedicure',
            imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=500&h=500&auto=format&fit=crop',
            isActive: true,
        },
    });

    const service4 = await prisma.service.upsert({
        where: { id: 'service4' },
        update: {},
        create: {
            id: 'service4',
            name: 'Full Set Acrylic',
            description: 'Complete acrylic nail application with tips or forms, shaping, and polish or gel color.',
            duration: 75,
            price: 55.00,
            category: 'Acrylic',
            imageUrl: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?q=80&w=500&h=500&auto=format&fit=crop',
            isActive: true,
        },
    });

    console.log('Created services');

    // Create add-ons
    const addon1 = await prisma.addOn.upsert({
        where: { id: 'addon1' },
        update: {},
        create: {
            id: 'addon1',
            name: 'Nail Art (Simple)',
            description: 'Simple designs like dots, stripes, or French tips on 1-2 accent nails.',
            price: 5.00,
            serviceId: service1.id,
            isActive: true,
        },
    });

    const addon2 = await prisma.addOn.upsert({
        where: { id: 'addon2' },
        update: {},
        create: {
            id: 'addon2',
            name: 'Nail Art (Complex)',
            description: 'Detailed designs, patterns, or hand-painted art on multiple nails.',
            price: 15.00,
            serviceId: service2.id,
            isActive: true,
        },
    });

    const addon3 = await prisma.addOn.upsert({
        where: { id: 'addon3' },
        update: {},
        create: {
            id: 'addon3',
            name: 'Paraffin Treatment',
            description: 'Warm paraffin wax treatment for hands or feet to soften and moisturize skin.',
            price: 10.00,
            serviceId: service3.id,
            isActive: true,
        },
    });

    console.log('Created add-ons');

    // Create staff service associations
    await prisma.staffService.createMany({
        skipDuplicates: true,
        data: [
            { staffId: staffProfile1.id, serviceId: service1.id },
            { staffId: staffProfile1.id, serviceId: service2.id },
            { staffId: staffProfile1.id, serviceId: service3.id },
            { staffId: staffProfile2.id, serviceId: service2.id },
            { staffId: staffProfile2.id, serviceId: service4.id },
            { staffId: staffProfile3.id, serviceId: service1.id },
            { staffId: staffProfile3.id, serviceId: service3.id },
        ],
    });

    console.log('Created staff service associations');

    // Create schedules
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const scheduleData = [];

    for (const day of days) {
        scheduleData.push(
            {
                staffId: staffProfile1.id,
                startTime: new Date(2023, 0, 1, 9, 0), // 9:00 AM
                endTime: new Date(2023, 0, 1, 17, 0), // 5:00 PM
                dayOfWeek: day,
                isAvailable: true,
            },
            {
                staffId: staffProfile2.id,
                startTime: new Date(2023, 0, 1, 10, 0), // 10:00 AM
                endTime: new Date(2023, 0, 1, 18, 0), // 6:00 PM
                dayOfWeek: day,
                isAvailable: true,
            },
            {
                staffId: staffProfile3.id,
                startTime: new Date(2023, 0, 1, 11, 0), // 11:00 AM
                endTime: new Date(2023, 0, 1, 19, 0), // 7:00 PM
                dayOfWeek: day,
                isAvailable: true,
            }
        );
    }

    // Add weekend schedules for some staff
    scheduleData.push(
        {
            staffId: staffProfile1.id,
            startTime: new Date(2023, 0, 1, 10, 0), // 10:00 AM
            endTime: new Date(2023, 0, 1, 16, 0), // 4:00 PM
            dayOfWeek: 6, // Saturday
            isAvailable: true,
        },
        {
            staffId: staffProfile2.id,
            startTime: new Date(2023, 0, 1, 10, 0), // 10:00 AM
            endTime: new Date(2023, 0, 1, 16, 0), // 4:00 PM
            dayOfWeek: 6, // Saturday
            isAvailable: true,
        }
    );

    await prisma.schedule.createMany({
        skipDuplicates: true,
        data: scheduleData,
    });

    console.log('Created schedules');

    console.log('Database seeding completed successfully');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error seeding database:', e);
        await prisma.$disconnect();
        process.exit(1);
    }); 