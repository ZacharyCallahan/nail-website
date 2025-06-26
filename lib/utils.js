import { clsx } from "clsx";
import { addMinutes, format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This allows for conditional classes and prevents class conflicts
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency for display (e.g., $25.00)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

/**
 * Format date for display (e.g., Monday, January 1, 2023)
 */
export function formatDate(date, formatStr = 'PPP') {
    if (!date) return '';
    return format(typeof date === 'string' ? parseISO(date) : date, formatStr);
}

/**
 * Format time for display (e.g., 2:30 PM)
 */
export function formatTime(time) {
    if (!time) return '';
    try {
        // Handle different time formats
        let hours, minutes;

        if (typeof time === 'string') {
            if (time.includes('T')) {
                // ISO format date string
                const date = new Date(time);
                hours = date.getHours();
                minutes = date.getMinutes();
            } else if (time.includes(':')) {
                // HH:MM format
                [hours, minutes] = time.split(':').map(Number);
            } else {
                return time; // Return as is if format is unknown
            }
        } else if (time instanceof Date) {
            hours = time.getHours();
            minutes = time.getMinutes();
        } else {
            return time; // Return as is if format is unknown
        }

        // Convert to 12-hour format with AM/PM
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12
        minutes = minutes.toString().padStart(2, '0');

        return `${hours}:${minutes} ${period}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return time; // Return original time if there's an error
    }
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60));
}

/**
 * Calculate end time by adding duration to start time
 */
export function calculateEndTime(startTime, durationMinutes) {
    if (!startTime || !durationMinutes) return null;
    const jsStartTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
    return addMinutes(jsStartTime, durationMinutes);
}

/**
 * Get day of week from a date (0 = Sunday, 1 = Monday, etc.)
 */
export function getDayOfWeek(date) {
    if (!date) return null;
    const jsDate = typeof date === 'string' ? new Date(date) : date;
    return jsDate.getDay();
}

/**
 * Convert time string to date object with provided date
 */
export function timeToDate(timeStr, baseDate) {
    if (!timeStr || !baseDate) return null;

    try {
        const date = typeof baseDate === 'string' ? new Date(baseDate) : new Date(baseDate);

        if (timeStr.includes('T')) {
            // If it's already a full ISO date string, just parse it
            return new Date(timeStr);
        } else if (timeStr.includes(':')) {
            // If it's just a time string like "14:30"
            const [hours, minutes] = timeStr.split(':').map(Number);
            date.setHours(hours, minutes, 0, 0);
            return date;
        }

        return date;
    } catch (error) {
        console.error('Error converting time to date:', error);
        return null;
    }
} 