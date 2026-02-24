/**
 * Convex Typing Indicators Module
 *
 * Handles real-time typing status for conversations.
 * Typing indicators auto-expire after ~2 seconds of inactivity.
 *
 * Data Flow: MessageInput (keypress) → setTyping mutation → typingIndicators table
 *            ChatArea ← getTypingUsers query (subscription) → "Alex is typing..."
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Typing indicator expiry threshold in milliseconds (~2 seconds) */
const TYPING_EXPIRY_MS = 2000;

/**
 * Set or refresh typing indicator for a user in a conversation
 * Uses upsert logic — creates if not exists, updates timestamp if exists
 * @param conversationId - Conversation where user is typing
 * @param userId - User who is typing
 */
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_user_conversation", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        if (existing) {
            // Refresh the timestamp
            await ctx.db.patch(existing._id, {
                updatedAt: Date.now(),
            });
        } else {
            // Create new typing indicator
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: args.userId,
                updatedAt: Date.now(),
            });
        }
    },
});

/**
 * Remove typing indicator when user stops typing or sends a message
 * @param conversationId - Conversation to clear typing for
 * @param userId - User to clear typing for
 */
export const clearTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_user_conversation", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

/**
 * Get all currently typing users in a conversation
 * Filters out expired indicators (older than TYPING_EXPIRY_MS)
 * Excludes the current user from the result
 * @param conversationId - Conversation to check
 * @param currentUserId - Current user to exclude from results
 * @return Array of typing user names
 */
export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
        currentUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const now = Date.now();
        const activeIndicators = indicators.filter(
            (indicator) =>
                indicator.userId !== args.currentUserId &&
                now - indicator.updatedAt < TYPING_EXPIRY_MS
        );

        // Resolve user names for active typing indicators
        const typingUsers = await Promise.all(
            activeIndicators.map(async (indicator) => {
                const user = await ctx.db.get(indicator.userId);
                return user?.name ?? "Someone";
            })
        );

        return typingUsers;
    },
});
