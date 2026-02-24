/**
 * Date Formatter — Strategy Pattern
 *
 * Formats message timestamps according to the assignment rules:
 *   - Today's messages: time only (e.g., "2:34 PM")
 *   - Older messages this year: date + time (e.g., "Feb 15, 2:34 PM")
 *   - Different year: date + time + year (e.g., "Feb 15, 2024, 2:34 PM")
 */

/**
 * Check if a timestamp is from today
 * @param timestamp - Unix timestamp in milliseconds
 * @return True if the timestamp is from today
 */
function isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

/**
 * Check if a timestamp is from the current year
 * @param timestamp - Unix timestamp in milliseconds
 * @return True if the timestamp is from the current year
 */
function isThisYear(timestamp: number): boolean {
    return new Date(timestamp).getFullYear() === new Date().getFullYear();
}

/**
 * Format a message timestamp using the Strategy Pattern
 * Selects the appropriate formatting strategy based on the date
 * @param timestamp - Unix timestamp in milliseconds
 * @return Formatted date string
 */
export function formatMessageTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(timestamp)) {
        // Strategy 1: Today — time only
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    if (isThisYear(timestamp)) {
        // Strategy 2: This year — month day, time
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Strategy 3: Different year — month day, year, time
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/**
 * Format a timestamp for sidebar preview (compact format)
 * @param timestamp - Unix timestamp in milliseconds
 * @return Compact formatted date string
 */
export function formatSidebarTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(timestamp)) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    if (isThisYear(timestamp)) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
