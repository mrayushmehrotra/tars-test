/**
 * MessageService — Repository/Service Layer
 *
 * Encapsulates message-related business logic.
 * Acts as an abstraction between hooks and Convex mutations/queries.
 *
 * Pattern: Repository Pattern — services abstract the data layer
 * Architecture: UI → hooks → services → Convex
 */
import { Id } from "../../convex/_generated/dataModel";

/** Enriched reaction type after grouping */
interface ReactionGroup {
    emoji: string;
    count: number;
    hasReacted: boolean;
    users: string[];
}

/**
 * Service class for message-related operations
 * Provides business logic for messages, outside of UI components
 */
export class MessageService {
    /**
     * Check if the current user is the sender of a message
     * @param senderId - Message sender's ID
     * @param currentUserId - Current user's ID
     * @return True if the current user sent the message
     */
    static isOwnMessage(
        senderId: Id<"users">,
        currentUserId: Id<"users">
    ): boolean {
        return senderId === currentUserId;
    }

    /**
     * Group reactions by emoji and compute counts
     * @param reactions - Array of individual reactions
     * @param currentUserId - Current user's ID (to check own reactions)
     * @return Record of emoji → { emoji, count, hasReacted, users }
     */
    static groupReactions(
        reactions: Array<{
            emoji: string;
            userId: Id<"users">;
            userName: string;
        }>,
        currentUserId: Id<"users">
    ): Record<string, ReactionGroup> {
        return reactions.reduce(
            (acc, reaction) => {
                if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = {
                        emoji: reaction.emoji,
                        count: 0,
                        hasReacted: false,
                        users: [],
                    };
                }
                acc[reaction.emoji].count++;
                acc[reaction.emoji].users.push(reaction.userName);
                if (reaction.userId === currentUserId) {
                    acc[reaction.emoji].hasReacted = true;
                }
                return acc;
            },
            {} as Record<string, ReactionGroup>
        );
    }

    /**
     * Validate that a message body is not empty after trimming
     * @param body - Raw message text
     * @return Trimmed message or null if invalid
     */
    static validateMessageBody(body: string): string | null {
        const trimmed = body.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    /**
     * Get initials from a user name for avatar fallback
     * @param name - User's full name
     * @return 1-2 character uppercase initials
     */
    static getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
}
