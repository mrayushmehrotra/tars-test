/**
 * Convex Conversations Module
 *
 * Handles conversation CRUD operations for both 1:1 and group chats.
 * Uses Factory Pattern: createDirectConversation vs createGroupConversation.
 *
 * Data Flow: Frontend → mutation → conversations + conversationMembers tables
 *            Frontend → query (subscription) → sidebar list
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get or create a direct (1:1) conversation between two users
 * If a conversation already exists between the two users, return it.
 * Otherwise, create a new one.
 * @param currentUserId - The current user's ID
 * @param otherUserId - The other user's ID
 * @return conversationId
 */
export const getOrCreateDirectConversation = mutation({
    args: {
        currentUserId: v.id("users"),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Find all conversations the current user is a member of
        const currentUserMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", args.currentUserId))
            .collect();

        // Check each conversation to see if the other user is also a member
        for (const membership of currentUserMemberships) {
            const conversation = await ctx.db.get(membership.conversationId);
            if (!conversation || conversation.isGroup) continue;

            const otherMembership = await ctx.db
                .query("conversationMembers")
                .withIndex("by_user_conversation", (q) =>
                    q
                        .eq("userId", args.otherUserId)
                        .eq("conversationId", membership.conversationId)
                )
                .unique();

            if (otherMembership) {
                return membership.conversationId;
            }
        }

        // No existing direct conversation found — create one
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
            createdAt: Date.now(),
        });

        const now = Date.now();

        // Add both users as members
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.currentUserId,
            lastReadAt: now,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.otherUserId,
            lastReadAt: now,
        });

        return conversationId;
    },
});

/**
 * Create a group conversation with multiple members
 * @param name - Group name
 * @param memberIds - Array of user IDs to add to the group
 * @param creatorId - The user creating the group
 * @return conversationId
 */
export const createGroupConversation = mutation({
    args: {
        name: v.string(),
        memberIds: v.array(v.id("users")),
        creatorId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            name: args.name,
            createdAt: Date.now(),
        });

        const now = Date.now();

        // Add the creator as a member
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.creatorId,
            lastReadAt: now,
        });

        // Add all selected members
        for (const memberId of args.memberIds) {
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: memberId,
                lastReadAt: now,
            });
        }

        return conversationId;
    },
});

/**
 * Get all conversations the current user is a member of
 * Includes: conversation metadata, other members, latest message, and unread count
 * @param userId - Current user's ID
 * @return Array of enriched conversation objects
 */
export const getUserConversations = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Get all memberships for the current user
        const memberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        const conversations = [];

        for (const membership of memberships) {
            const conversation = await ctx.db.get(membership.conversationId);
            if (!conversation) continue;

            // Get all members of this conversation
            const allMembers = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conversation._id)
                )
                .collect();

            // Resolve member user profiles
            const memberUsers = await Promise.all(
                allMembers.map(async (m) => await ctx.db.get(m.userId))
            );

            // Get the latest message for sidebar preview
            const latestMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversation_createdAt", (q) =>
                    q.eq("conversationId", conversation._id)
                )
                .order("desc")
                .first();

            // Calculate unread count: messages created after lastReadAt
            const unreadMessages = await ctx.db
                .query("messages")
                .withIndex("by_conversation_createdAt", (q) =>
                    q.eq("conversationId", conversation._id)
                )
                .collect();

            const unreadCount = unreadMessages.filter(
                (msg) => msg.createdAt > membership.lastReadAt && msg.senderId !== args.userId
            ).length;

            // Get sender info for latest message preview
            let latestMessageSender = null;
            if (latestMessage) {
                latestMessageSender = await ctx.db.get(latestMessage.senderId);
            }

            conversations.push({
                ...conversation,
                members: memberUsers.filter(Boolean),
                latestMessage,
                latestMessageSender,
                unreadCount,
                memberCount: allMembers.length,
            });
        }

        // Sort by latest message or creation time (newest first)
        conversations.sort((a, b) => {
            const aTime = a.latestMessage?.createdAt ?? a.createdAt;
            const bTime = b.latestMessage?.createdAt ?? b.createdAt;
            return bTime - aTime;
        });

        return conversations;
    },
});

/**
 * Mark a conversation as read for the current user
 * Updates lastReadAt to current timestamp to clear unread count
 * @param userId - Current user's ID
 * @param conversationId - Conversation to mark as read
 */
export const markAsRead = mutation({
    args: {
        userId: v.id("users"),
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_user_conversation", (q) =>
                q
                    .eq("userId", args.userId)
                    .eq("conversationId", args.conversationId)
            )
            .unique();

        if (membership) {
            await ctx.db.patch(membership._id, {
                lastReadAt: Date.now(),
            });
        }
    },
});

/**
 * Get conversation details by ID
 * @param conversationId - Conversation ID
 * @return Conversation document with member details
 */
export const getConversationById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversation._id)
            )
            .collect();

        const memberUsers = await Promise.all(
            members.map(async (m) => await ctx.db.get(m.userId))
        );

        return {
            ...conversation,
            members: memberUsers.filter(Boolean),
            memberCount: members.length,
        };
    },
});
