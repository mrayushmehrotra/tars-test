/**
 * Convex Messages Module
 *
 * Handles sending, retrieving, and soft-deleting messages.
 * Messages are stored with timestamps and support soft delete.
 *
 * Data Flow: MessageInput → sendMessage mutation → messages table
 *            MessageList ← getMessages query (subscription) ← messages table
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Send a new message in a conversation
 * @param conversationId - Target conversation
 * @param senderId - User sending the message
 * @param body - Message text content
 * @return Message ID
 */
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            body: args.body,
            createdAt: Date.now(),
            isDeleted: false,
        });

        // Remove typing indicator for this user in this conversation after sending
        const typingIndicator = await ctx.db
            .query("typingIndicators")
            .withIndex("by_user_conversation", (q) =>
                q
                    .eq("userId", args.senderId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        if (typingIndicator) {
            await ctx.db.delete(typingIndicator._id);
        }

        return messageId;
    },
});

/**
 * Get all messages for a conversation, ordered by creation time (ascending)
 * Includes sender info for each message
 * @param conversationId - Conversation to fetch messages for
 * @return Array of messages with sender details
 */
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation_createdAt", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich each message with sender info and reactions
        const enrichedMessages = await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);

                // Get reactions for this message
                const reactions = await ctx.db
                    .query("reactions")
                    .withIndex("by_messageId", (q) => q.eq("messageId", message._id))
                    .collect();

                // Enrich reactions with user info
                const enrichedReactions = await Promise.all(
                    reactions.map(async (reaction) => {
                        const user = await ctx.db.get(reaction.userId);
                        return {
                            ...reaction,
                            userName: user?.name ?? "Unknown",
                        };
                    })
                );

                return {
                    ...message,
                    sender,
                    reactions: enrichedReactions,
                };
            })
        );

        return enrichedMessages;
    },
});

/**
 * Soft delete a message — sets isDeleted to true without removing the record
 * Only the message sender should be allowed to delete their own messages
 * @param messageId - Message to soft-delete
 * @param userId - User requesting deletion (must be sender)
 */
export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        // Only the sender can delete their own message
        if (message.senderId !== args.userId) {
            throw new Error("You can only delete your own messages");
        }

        await ctx.db.patch(args.messageId, {
            isDeleted: true,
        });
    },
});
