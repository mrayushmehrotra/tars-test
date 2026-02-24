/**
 * ReactionService — Repository/Service Layer
 *
 * Encapsulates reaction-related business logic.
 * Acts as an abstraction between hooks and Convex mutations/queries.
 *
 * Pattern: Repository Pattern — services abstract the data layer
 * Architecture: UI → hooks → services → Convex
 */
import { ALLOWED_REACTIONS } from "@/lib/constants";

/**
 * Service class for reaction-related operations
 * Provides validation and formatting for emoji reactions
 */
export class ReactionService {
    /**
     * Validate that an emoji is in the allowed set
     * Allowed: 👍 ❤️ 😂 😮 😢
     * @param emoji - Emoji string to validate
     * @return True if the emoji is allowed
     */
    static isValidEmoji(emoji: string): boolean {
        return (ALLOWED_REACTIONS as readonly string[]).includes(emoji);
    }

    /**
     * Get the full list of allowed reaction emojis
     * @return Array of allowed emoji strings
     */
    static getAllowedEmojis(): readonly string[] {
        return ALLOWED_REACTIONS;
    }

    /**
     * Format a list of user names who reacted with a specific emoji
     * @param users - Array of user names
     * @return Formatted string like "Alice, Bob, and 2 others"
     */
    static formatReactedUsers(users: string[]): string {
        if (users.length === 0) return "";
        if (users.length === 1) return users[0];
        if (users.length === 2) return `${users[0]} and ${users[1]}`;
        return `${users[0]}, ${users[1]}, and ${users.length - 2} others`;
    }
}
