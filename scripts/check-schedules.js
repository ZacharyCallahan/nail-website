const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchedules() {
    try {
        console.log("Checking schedules in the database...");

        // Get all staff members
        const staff = await prisma.staff.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                services: true
            }
        });

        console.log(`Found ${staff.length} staff members`);

        for (const staffMember of staff) {
            console.log(`\n--- Staff: ${staffMember.user.name} (ID: ${staffMember.id}) ---`);
            console.log(`Services: ${staffMember.services.length}`);

            // Get weekly schedules for this staff member
            const weeklySchedules = await prisma.schedule.findMany({
                where: {
                    staffId: staffMember.id,
                    specificDate: null
                },
                orderBy: {
                    dayOfWeek: 'asc'
                }
            });

            console.log(`Weekly schedules: ${weeklySchedules.length}`);

            if (weeklySchedules.length > 0) {
                console.log("Day of Week | Start Time | End Time | Available");
                console.log("------------|------------|----------|----------");

                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                weeklySchedules.forEach(schedule => {
                    const dayName = dayNames[schedule.dayOfWeek];
                    const startTime = schedule.startTime ? new Date(schedule.startTime).toLocaleTimeString() : 'N/A';
                    const endTime = schedule.endTime ? new Date(schedule.endTime).toLocaleTimeString() : 'N/A';

                    console.log(`${dayName.padEnd(12)}| ${startTime.padEnd(12)}| ${endTime.padEnd(10)}| ${schedule.isAvailable ? 'Yes' : 'No'}`);
                });
            }

            // Get specific date schedules for this staff member
            const specificSchedules = await prisma.schedule.findMany({
                where: {
                    staffId: staffMember.id,
                    specificDate: {
                        not: null
                    }
                },
                orderBy: {
                    specificDate: 'asc'
                }
            });

            console.log(`\nSpecific date schedules: ${specificSchedules.length}`);

            if (specificSchedules.length > 0) {
                console.log("Date       | Start Time | End Time | Available");
                console.log("-----------|------------|----------|----------");

                specificSchedules.forEach(schedule => {
                    const date = schedule.specificDate ? schedule.specificDate.toLocaleDateString() : 'N/A';
                    const startTime = schedule.startTime ? new Date(schedule.startTime).toLocaleTimeString() : 'N/A';
                    const endTime = schedule.endTime ? new Date(schedule.endTime).toLocaleTimeString() : 'N/A';

                    console.log(`${date.padEnd(11)}| ${startTime.padEnd(12)}| ${endTime.padEnd(10)}| ${schedule.isAvailable ? 'Yes' : 'No'}`);
                });
            }
        }

        // Check for any upcoming appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: today
                }
            },
            include: {
                service: true,
                staff: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        console.log(`\n\n--- Upcoming Appointments: ${appointments.length} ---`);

        if (appointments.length > 0) {
            console.log("Date       | Time     | Service                | Staff           | Status");
            console.log("-----------|----------|------------------------|-----------------|-------");

            appointments.forEach(appointment => {
                const date = appointment.startTime.toLocaleDateString();
                const time = appointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const service = appointment.service.name.padEnd(24).substring(0, 24);
                const staff = appointment.staff.user.name.padEnd(17).substring(0, 17);

                console.log(`${date.padEnd(11)}| ${time.padEnd(10)}| ${service}| ${staff}| ${appointment.status}`);
            });
        }

    } catch (error) {
        console.error("Error checking schedules:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchedules()
    .then(() => console.log("\nDone checking schedules!"))
    .catch(e => console.error(e)); 