/**
 * useOnlineStatus Hook
 *
 * Manages the current user's online/offline status.
 * Sets user as online on mount, offline on unmount.
 * Uses visibility change API to detect when user leaves/returns to the tab.
 *
 * Data Flow: Browser events → updateOnlineStatus mutation → users table
 */
"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Tracks and updates the current user's online/offline status
 * Automatically handles tab visibility changes and window unload
 * @param userId - Current user's Convex ID
 */
export function useOnlineStatus(userId: Id<"users"> | undefined) {
    const updateStatus = useMutation(api.users.updateOnlineStatus);

    useEffect(() => {
        if (!userId) return;

        // Set user as online when hook mounts
        updateStatus({ userId, isOnline: true });

        /**
         * Handle visibility change — user switches tabs or minimizes
         * Online when tab is visible, offline when hidden
         */
        const handleVisibilityChange = () => {
            updateStatus({
                userId,
                isOnline: document.visibilityState === "visible",
            });
        };

        /**
         * Handle before unload — user closes the tab/browser
         * Set offline status before the page unloads
         */
        const handleBeforeUnload = () => {
            // Use navigator.sendBeacon is not available for Convex mutations,
            // so we rely on the visibility change handler and Convex's
            // eventual consistency for cleanup
            updateStatus({ userId, isOnline: false });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup: set offline when component unmounts
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateStatus({ userId, isOnline: false });
        };
    }, [userId, updateStatus]);
}
