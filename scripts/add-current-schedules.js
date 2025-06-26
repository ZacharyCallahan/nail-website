const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addDays, format } = require('date-fns');

async function addCurrentSchedules() {
    try {
        console.log("Adding schedules for current dates...");

        // Get all staff members
        const staff = await prisma.staff.findMany({
            where: {
                isActive: true
            },
            include: {
                user: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        console.log(`Found ${staff.length} active staff members`);

        // Create schedules for the next 30 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const schedules = [];

        for (const staffMember of staff) {
            console.log(`Creating schedules for ${staffMember.user.name}...`);

            // Create schedules for the next 30 days
            for (let i = 0; i < 30; i++) {
                const date = addDays(today, i);
                const formattedDate = format(date, 'yyyy-MM-dd');

                // Skip weekends for some staff to create variety
                const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                if (staffMember.id === 'cmcckwj4b0007mh9aspgxqgp6' && (dayOfWeek === 0 || dayOfWeek === 6)) {
                    console.log(`  Skipping weekend day ${formattedDate} for ${staffMember.user.name}`);
                    continue;
                }

                // Create start and end times
                const startTime = new Date(date);
                startTime.setHours(9, 0, 0, 0); // 9:00 AM

                const endTime = new Date(date);
                endTime.setHours(17, 0, 0, 0); // 5:00 PM

                // Check if a schedule already exists for this staff and date
                const existingSchedule = await prisma.schedule.findFirst({
                    where: {
                        staffId: staffMember.id,
                        specificDate: {
                            gte: new Date(date.setHours(0, 0, 0, 0)),
                            lte: new Date(date.setHours(23, 59, 59, 999))
                        }
                    }
                });

                if (existingSchedule) {
                    console.log(`  Schedule already exists for ${staffMember.user.name} on ${formattedDate}`);
                    continue;
                }

                // Create the schedule
                const schedule = await prisma.schedule.create({
                    data: {
                        staffId: staffMember.id,
                        specificDate: date,
                        startTime: startTime,
                        endTime: endTime,
                        isAvailable: true
                    }
                });

                schedules.push(schedule);
                console.log(`  Created schedule for ${staffMember.user.name} on ${formattedDate}`);
            }
        }

        console.log(`Created ${schedules.length} new schedules`);

    } catch (error) {
        console.error("Error adding schedules:", error);
    } finally {
        await prisma.$disconnect();
    }
}

addCurrentSchedules()
    .then(() => console.log("Done adding schedules!"))
    .catch(e => console.error(e)); 