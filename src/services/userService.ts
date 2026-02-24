/**
 * UserService — Repository/Service Layer
 *
 * Encapsulates user-related business logic.
 * Acts as an abstraction between hooks and Convex mutations/queries.
 *
 * Pattern: Repository Pattern — services abstract the data layer
 * Architecture: UI → hooks → services → Convex
 */

/**
 * Service class for user-related operations
 * Provides business logic for user display and status
 */
export class UserService {
    /**
     * Get initials from a user's name for avatar fallback
     * @param name - User's full name
     * @return 1-2 character uppercase initials
     */
    static getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    /**
     * Get a human-readable online status string
     * @param isOnline - Whether the user is online
     * @return "Online" or "Offline"
     */
    static getStatusText(isOnline: boolean): string {
        return isOnline ? "Online" : "Offline";
    }

    /**
     * Build display name from Clerk user data
     * Falls back to "Anonymous" if no name is available
     * @param fullName - User's full name from Clerk
     * @param firstName - User's first name from Clerk
     * @return Display name string
     */
    static buildDisplayName(
        fullName: string | null | undefined,
        firstName: string | null | undefined
    ): string {
        return fullName ?? firstName ?? "Anonymous";
    }
}
