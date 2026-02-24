/**
 * useAuthUser Hook
 *
 * Manages the authenticated user's state by syncing Clerk auth
 * with Convex user records. Handles initial user creation via
 * the upsertUser mutation when a new user signs in.
 *
 * Data Flow: Clerk useUser() → upsertUser mutation → getUserByClerkId query
 */
"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { UserService } from "@/services/userService";

/**
 * Returns the current authenticated user from Convex
 * Automatically syncs Clerk user data to Convex on first load
 * @return Object containing the Convex user document and loading state
 */
export function useAuthUser() {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const upsertUser = useMutation(api.users.upsertUser);

    // Query the Convex user by Clerk ID
    const convexUser = useQuery(
        api.users.getUserByClerkId,
        clerkUser ? { clerkId: clerkUser.id } : "skip"
    );

    // Sync Clerk user data to Convex on mount / when Clerk user changes
    useEffect(() => {
        if (!clerkUser) return;

        const syncUser = async () => {
            await upsertUser({
                clerkId: clerkUser.id,
                name: UserService.buildDisplayName(clerkUser.fullName, clerkUser.firstName),
                email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
                avatarUrl: clerkUser.imageUrl ?? "",
            });
        };

        syncUser();
    }, [clerkUser, upsertUser]);

    return {
        user: convexUser,
        isLoading: !isClerkLoaded || convexUser === undefined,
        isAuthenticated: !!clerkUser,
    };
}
