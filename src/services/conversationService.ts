/**
 * ConversationService — Repository/Service Layer
 *
 * Encapsulates conversation-related business logic.
 * Acts as an abstraction between hooks and Convex mutations/queries.
 *
 * Pattern: Repository Pattern — services abstract the data layer
 * Architecture: UI → hooks → services → Convex
 */
import { Id } from "../../convex/_generated/dataModel";

/**
 * Service class for conversation-related operations
 * Provides a clean API for creating and managing conversations
 */
export class ConversationService {
    /**
     * Determine display name for a conversation
     * For direct chats: other user's name
     * For groups: group name
     * @param conversation - Conversation with members
     * @param currentUserId - Current user's ID
     * @return Display name string
     */
    static getDisplayName(
        conversation: {
            isGroup: boolean;
            name?: string;
            members: Array<{ _id: Id<"users">; name: string }>;
        },
        currentUserId: Id<"users">
    ): string {
        if (conversation.isGroup) {
            return conversation.name ?? "Group";
        }

        const otherUser = conversation.members.find(
            (m) => m._id !== currentUserId
        );
        return otherUser?.name ?? "Unknown";
    }

    /**
     * Get the other user in a direct conversation
     * @param members - Array of conversation members
     * @param currentUserId - Current user's ID
     * @return The other user or undefined
     */
    static getOtherUser<
        T extends { _id: Id<"users"> }
    >(members: T[], currentUserId: Id<"users">): T | undefined {
        return members.find((m) => m._id !== currentUserId);
    }

    /**
     * Build a message preview string for the sidebar
     * @param latestMessage - Latest message object or null
     * @param senderName - Sender's name (for group chats)
     * @param isGroup - Whether the conversation is a group
     * @return Preview text string
     */
    static getMessagePreview(
        latestMessage: { body: string; isDeleted: boolean } | null,
        senderName: string | null,
        isGroup: boolean
    ): string {
        if (!latestMessage) return "No messages yet";
        if (latestMessage.isDeleted) return "This message was deleted";

        const prefix =
            isGroup && senderName ? `${senderName.split(" ")[0]}: ` : "";
        return `${prefix}${latestMessage.body}`;
    }
}
