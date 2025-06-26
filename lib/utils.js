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
 * Format a date string to a human-readable format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateString);
            return '';
        }

        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return '';
    }
}

/**
 * Format a time string to a human-readable format
 * @param {string|Date} timeString - The time to format
 * @returns {string} Formatted time string
 */
export function formatTime(timeString) {
    if (!timeString) return '';

    try {
        // Handle different time formats
        let hours, minutes;

        if (typeof timeString === 'string') {
            if (timeString.includes('T')) {
                // ISO format date string
                const date = new Date(timeString);
                if (isNaN(date.getTime())) {
                    console.error("Invalid date from ISO string:", timeString);
                    return '';
                }
                hours = date.getHours();
                minutes = date.getMinutes();
            } else if (timeString.includes(':')) {
                // HH:MM format
                [hours, minutes] = timeString.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) {
                    console.error("Invalid time format:", timeString);
                    return '';
                }
            } else {
                console.error("Unknown time format:", timeString);
                return '';
            }
        } else if (timeString instanceof Date) {
            if (isNaN(timeString.getTime())) {
                console.error("Invalid Date object:", timeString);
                return '';
            }
            hours = timeString.getHours();
            minutes = timeString.getMinutes();
        } else {
            console.error("Unsupported time format:", timeString);
            return '';
        }

        // Convert to 12-hour format with AM/PM
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12
        minutes = minutes.toString().padStart(2, '0');

        return `${hours}:${minutes} ${period}`;
    } catch (error) {
        console.error("Error formatting time:", error, "for input:", timeString);
        return '';
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