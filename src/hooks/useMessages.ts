/**
 * useMessages Hook
 *
 * Manages message data for a conversation including sending,
 * deleting, and reacting to messages.
 *
 * Data Flow: Convex subscription → getMessages query → MessageList UI
 *            MessageInput → sendMessage mutation → messages table
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Provides messages and message operations for a conversation
 * @param conversationId - Current conversation ID
 * @param userId - Current user's Convex ID
 */
export function useMessages(
    conversationId: Id<"conversations"> | undefined,
    userId: Id<"users"> | undefined
) {
    const [sendError, setSendError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Real-time subscription to conversation messages
    const messages = useQuery(
        api.messages.getMessages,
        conversationId ? { conversationId } : "skip"
    );

    const sendMessageMutation = useMutation(api.messages.sendMessage);
    const deleteMessageMutation = useMutation(api.messages.deleteMessage);
    const toggleReactionMutation = useMutation(api.reactions.toggleReaction);

    /**
     * Send a message in the current conversation
     * Includes error handling with retry capability
     * @param body - Message text content
     */
    const sendMessage = async (body: string) => {
        if (!conversationId || !userId || !body.trim()) return;

        setIsSending(true);
        setSendError(null);

        try {
            await sendMessageMutation({
                conversationId,
                senderId: userId,
                body: body.trim(),
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to send message";
            setSendError(errorMessage);
            throw error; // Re-throw so the UI can handle retry
        } finally {
            setIsSending(false);
        }
    };

    /**
     * Soft delete a message (only the sender can delete their own)
     * @param messageId - Message to delete
     */
    const deleteMessage = async (messageId: Id<"messages">) => {
        if (!userId) return;
        await deleteMessageMutation({ messageId, userId });
    };

    /**
     * Toggle an emoji reaction on a message
     * @param messageId - Message to react to
     * @param emoji - Emoji to toggle
     */
    const toggleReaction = async (
        messageId: Id<"messages">,
        emoji: string
    ) => {
        if (!userId) return;
        await toggleReactionMutation({ messageId, userId, emoji });
    };

    return {
        messages,
        isLoading: messages === undefined,
        isSending,
        sendError,
        clearError: () => setSendError(null),
        sendMessage,
        deleteMessage,
        toggleReaction,
    };
}
