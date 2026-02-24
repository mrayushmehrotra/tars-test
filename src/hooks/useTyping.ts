/**
 * useTyping Hook
 *
 * Manages typing indicator for the current user in a conversation.
 * Sends typing events on keypress with debouncing.
 * Auto-clears typing indicator after inactivity.
 *
 * Data Flow: keypress → setTyping mutation (debounced) → typingIndicators table
 *            Convex subscription → getTypingUsers query → TypingIndicator UI
 */
"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TYPING_DEBOUNCE_MS, TYPING_EXPIRY_MS } from "@/lib/constants";

/**
 * Provides typing indicator state and handlers for a conversation
 * @param conversationId - Current conversation ID
 * @param userId - Current user's Convex ID
 */
export function useTyping(
    conversationId: Id<"conversations"> | undefined,
    userId: Id<"users"> | undefined
) {
    const setTypingMutation = useMutation(api.typing.setTyping);
    const clearTypingMutation = useMutation(api.typing.clearTyping);

    // Debounce timer ref for typing events
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingRef = useRef<number>(0);

    // Real-time subscription to typing users in this conversation
    const typingUsers = useQuery(
        api.typing.getTypingUsers,
        conversationId && userId
            ? { conversationId, currentUserId: userId }
            : "skip"
    );

    /**
     * Called on every keypress in the message input
     * Debounces typing events to avoid excessive mutations
     */
    const handleTyping = useCallback(() => {
        if (!conversationId || !userId) return;

        const now = Date.now();

        // Only send typing event if enough time has passed since the last one
        if (now - lastTypingRef.current > TYPING_DEBOUNCE_MS) {
            lastTypingRef.current = now;
            setTypingMutation({ conversationId, userId });
        }

        // Clear existing timeout and set a new one
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Auto-clear typing after expiry threshold
        typingTimeoutRef.current = setTimeout(() => {
            clearTypingMutation({ conversationId, userId });
        }, TYPING_EXPIRY_MS);
    }, [conversationId, userId, setTypingMutation, clearTypingMutation]);

    /**
     * Explicitly clear typing (called when message is sent)
     */
    const stopTyping = useCallback(() => {
        if (!conversationId || !userId) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        clearTypingMutation({ conversationId, userId });
    }, [conversationId, userId, clearTypingMutation]);

    return {
        typingUsers: typingUsers ?? [],
        handleTyping,
        stopTyping,
    };
}
