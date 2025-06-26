const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addDays, format } = require('date-fns');

async function fixScheduleDates() {
    try {
        console.log("Fixing schedule dates to use current year...");

        // Get all schedules
        const schedules = await prisma.schedule.findMany();
        console.log(`Found ${schedules.length} schedules to update`);

        const currentYear = new Date().getFullYear();
        let updatedCount = 0;

        for (const schedule of schedules) {
            const specificDate = schedule.specificDate;

            if (specificDate) {
                // Create a new date with the current year but same month/day
                const oldDate = new Date(specificDate);
                const oldYear = oldDate.getFullYear();

                if (oldYear !== currentYear) {
                    const newDate = new Date(specificDate);
                    newDate.setFullYear(currentYear);

                    // Also update the startTime and endTime to use the current year
                    const newStartTime = new Date(schedule.startTime);
                    newStartTime.setFullYear(currentYear);

                    const newEndTime = new Date(schedule.endTime);
                    newEndTime.setFullYear(currentYear);

                    // Update the schedule
                    await prisma.schedule.update({
                        where: { id: schedule.id },
                        data: {
                            specificDate: newDate,
                            startTime: newStartTime,
                            endTime: newEndTime
                        }
                    });

                    console.log(`Updated schedule ${schedule.id}: ${format(oldDate, 'yyyy-MM-dd')} -> ${format(newDate, 'yyyy-MM-dd')}`);
                    updatedCount++;
                }
            }
        }

        console.log(`Updated ${updatedCount} schedules to use the current year (${currentYear})`);

    } catch (error) {
        console.error("Error fixing schedule dates:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixScheduleDates()
    .then(() => console.log("Done fixing schedule dates!"))
    .catch(e => console.error(e)); 