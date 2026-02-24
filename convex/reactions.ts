/**
 * Convex Reactions Module
 *
 * Handles toggling emoji reactions on messages.
 * Fixed emoji set: 👍 ❤️ 😂 😮 😢
 * Clicking the same reaction again removes it (toggle behavior).
 *
 * Data Flow: MessageItem → toggleReaction mutation → reactions table
 *            MessageItem ← reactions (fetched via messages query)
 */
import { v } from "convex/values";
import { mutation } from "./_generated/server";

/** Allowed emoji set as defined in the assignment */
const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

/**
 * Toggle a reaction on a message
 * If the user already has this reaction, remove it.
 * If the user has a different reaction, replace it.
 * If no reaction exists, add it.
 * @param messageId - Target message
 * @param userId - User reacting
 * @param emoji - Emoji to toggle (must be in ALLOWED_EMOJIS)
 */
export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate emoji is in allowed set
        if (!ALLOWED_EMOJIS.includes(args.emoji)) {
            throw new Error(`Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(", ")}`);
        }

        // Check if user already has this exact reaction on this message
        const existingReactions = await ctx.db
            .query("reactions")
            .withIndex("by_message_user", (q) =>
                q.eq("messageId", args.messageId).eq("userId", args.userId)
            )
            .collect();

        const sameReaction = existingReactions.find(
            (r) => r.emoji === args.emoji
        );

        if (sameReaction) {
            // Toggle off — remove the reaction
            await ctx.db.delete(sameReaction._id);
            return;
        }

        // Remove any existing reaction from this user on this message
        for (const reaction of existingReactions) {
            await ctx.db.delete(reaction._id);
        }

        // Add the new reaction
        await ctx.db.insert("reactions", {
            messageId: args.messageId,
            userId: args.userId,
            emoji: args.emoji,
        });
    },
});
