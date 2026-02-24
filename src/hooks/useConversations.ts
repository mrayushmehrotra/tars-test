/**
 * useConversations Hook
 *
 * Provides conversation data for the sidebar and manages
 * conversation-related operations (create, mark as read).
 *
 * Data Flow: Convex subscription → getUserConversations query → sidebar UI
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Fetches all conversations for the current user with real-time updates
 * Provides mutations for creating conversations and marking as read
 * @param userId - Current user's Convex ID
 */
export function useConversations(userId: Id<"users"> | undefined) {
    // Real-time subscription to user's conversations
    const conversations = useQuery(
        api.conversations.getUserConversations,
        userId ? { userId } : "skip"
    );

    const createDirect = useMutation(
        api.conversations.getOrCreateDirectConversation
    );
    const createGroup = useMutation(
        api.conversations.createGroupConversation
    );
    const markAsRead = useMutation(api.conversations.markAsRead);

    /**
     * Open or create a direct conversation with another user
     * @param otherUserId - The other user's ID
     * @return conversationId
     */
    const openDirectConversation = async (otherUserId: Id<"users">) => {
        if (!userId) throw new Error("Not authenticated");
        return await createDirect({
            currentUserId: userId,
            otherUserId,
        });
    };

    /**
     * Create a new group conversation
     * @param name - Group name
     * @param memberIds - Members to add
     * @return conversationId
     */
    const createGroupChat = async (
        name: string,
        memberIds: Id<"users">[]
    ) => {
        if (!userId) throw new Error("Not authenticated");
        return await createGroup({
            name,
            memberIds,
            creatorId: userId,
        });
    };

    /**
     * Mark a conversation as read, clearing unread count
     * @param conversationId - Conversation to mark as read
     */
    const markConversationAsRead = async (
        conversationId: Id<"conversations">
    ) => {
        if (!userId) return;
        await markAsRead({ userId, conversationId });
    };

    return {
        conversations,
        isLoading: conversations === undefined,
        openDirectConversation,
        createGroupChat,
        markConversationAsRead,
    };
}
