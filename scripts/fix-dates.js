// Script to fix dates in the database from 2023 to current year
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDates() {
    try {
        console.log('Starting date fix script...');

        // Get the current year
        const currentYear = new Date().getFullYear();
        console.log(`Current year: ${currentYear}`);

        // Find all schedules with 2023 dates
        const schedules = await prisma.schedule.findMany();

        console.log(`Found ${schedules.length} total schedule records`);

        let updatedCount = 0;

        // Process each schedule
        for (const schedule of schedules) {
            const startTime = new Date(schedule.startTime);
            const endTime = new Date(schedule.endTime);

            // Check if dates are from 2023
            if (startTime.getFullYear() === 2023 || endTime.getFullYear() === 2023) {
                console.log(`Fixing schedule ID: ${schedule.id}`);
                console.log(`  Old startTime: ${startTime}`);
                console.log(`  Old endTime: ${endTime}`);

                // Create new dates with current year
                const newStartTime = new Date(
                    currentYear,
                    startTime.getMonth(),
                    startTime.getDate(),
                    startTime.getHours(),
                    startTime.getMinutes()
                );

                const newEndTime = new Date(
                    currentYear,
                    endTime.getMonth(),
                    endTime.getDate(),
                    endTime.getHours(),
                    endTime.getMinutes()
                );

                console.log(`  New startTime: ${newStartTime}`);
                console.log(`  New endTime: ${newEndTime}`);

                // Update the record
                await prisma.schedule.update({
                    where: { id: schedule.id },
                    data: {
                        startTime: newStartTime,
                        endTime: newEndTime
                    }
                });

                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} records`);
        console.log('Date fix script completed successfully');

    } catch (error) {
        console.error('Error fixing dates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
fixDates(); 