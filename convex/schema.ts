/**
 * Convex Schema — Tars Chat Application
 *
 * Tables:
 *   1. users           — clerk-synced user profiles
 *   2. conversations   — 1:1 and group chats
 *   3. conversationMembers — many-to-many link between users & conversations
 *   4. messages        — chat messages with soft-delete
 *   5. reactions       — emoji reactions on messages
 *   6. typingIndicators — real-time typing status
 *
 * All timestamps stored as numbers (Date.now()).
 * No extra tables or fields beyond assignment requirements.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    /**
     * Users table — synced from Clerk via webhook
     * Stores profile info and online/offline status
     */
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_name", ["name"]),

    /**
     * Conversations table — supports both direct and group chats
     * Group conversations have a name; direct ones have name as null
     */
    conversations: defineTable({
        isGroup: v.boolean(),
        name: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),

    /**
     * ConversationMembers — junction table linking users to conversations
     * Tracks lastReadAt for unread message count calculation
     */
    conversationMembers: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadAt: v.number(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_userId", ["userId"])
        .index("by_user_conversation", ["userId", "conversationId"]),

    /**
     * Messages table — stores all chat messages
     * Supports soft delete via isDeleted flag
     */
    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
        createdAt: v.number(),
        isDeleted: v.boolean(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_conversation_createdAt", ["conversationId", "createdAt"]),

    /**
     * Reactions table — emoji reactions per message
     * Allowed emojis: 👍 ❤️ 😂 😮 😢
     */
    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    })
        .index("by_messageId", ["messageId"])
        .index("by_message_user", ["messageId", "userId"]),

    /**
     * TypingIndicators — real-time typing status
     * Auto-expires after ~2 seconds of inactivity
     */
    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        updatedAt: v.number(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_user_conversation", ["userId", "conversationId"]),
});
