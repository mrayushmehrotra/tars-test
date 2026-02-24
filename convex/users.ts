/**
 * Convex Users Module
 *
 * Handles user profile CRUD operations synced from Clerk.
 * Provides queries for user discovery, search, and online status.
 *
 * Data Flow: Clerk Webhook → upsertUser mutation → users table
 *            Frontend → getUsers query → user list display
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Upsert a user profile from Clerk webhook data
 * Creates a new user or updates existing one based on clerkId
 * @param clerkId - Clerk user ID
 * @param name - Display name
 * @param email - User email
 * @param avatarUrl - Profile image URL
 */
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
            });
            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            avatarUrl: args.avatarUrl,
            isOnline: false,
            lastSeen: Date.now(),
        });
    },
});

/**
 * Get the current authenticated user by their Clerk ID
 * @param clerkId - Clerk user ID
 * @return User document or null
 */
export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

/**
 * Get all registered users excluding the current user
 * Used for user list display and starting new conversations
 * @param currentUserId - ID of the currently logged-in user to exclude
 * @return Array of user documents
 */
export const getAllUsers = query({
    args: { currentUserId: v.id("users") },
    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect();
        return allUsers.filter((user) => user._id !== args.currentUserId);
    },
});

/**
 * Search users by name (case-insensitive partial match)
 * @param searchTerm - Text to search for in user names
 * @param currentUserId - ID of the currently logged-in user to exclude
 * @return Filtered array of user documents
 */
export const searchUsers = query({
    args: {
        searchTerm: v.string(),
        currentUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect();
        const lowerSearch = args.searchTerm.toLowerCase();
        return allUsers.filter(
            (user) =>
                user._id !== args.currentUserId &&
                user.name.toLowerCase().includes(lowerSearch)
        );
    },
});

/**
 * Update user's online status
 * Called when user connects/disconnects from the app
 * @param userId - User ID to update
 * @param isOnline - Whether the user is currently online
 */
export const updateOnlineStatus = mutation({
    args: {
        userId: v.id("users"),
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            isOnline: args.isOnline,
            lastSeen: Date.now(),
        });
    },
});

/**
 * Get a single user by their Convex ID
 * @param userId - Convex user ID
 * @return User document or null
 */
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
