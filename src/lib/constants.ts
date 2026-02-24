/**
 * Application Constants
 *
 * Centralized constants used across the application.
 * Following UPPER_SNAKE_CASE naming convention.
 */

/** Allowed emoji reactions as defined in the assignment */
export const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"] as const;

/** Typing indicator auto-expire threshold in milliseconds */
export const TYPING_EXPIRY_MS = 2000;

/** Typing debounce delay — how often to send typing updates */
export const TYPING_DEBOUNCE_MS = 500;

/** Online status heartbeat interval in milliseconds */
export const ONLINE_HEARTBEAT_MS = 30000;

/** Empty state messages */
export const EMPTY_STATE_MESSAGES = {
    NO_CONVERSATIONS: "No conversations yet. Start chatting with someone!",
    NO_MESSAGES: "No messages yet. Send a message to start the conversation!",
    NO_SEARCH_RESULTS: "No users found matching your search.",
    NO_SELECTED_CONVERSATION: "Select a conversation to start messaging",
} as const;

/** Mobile breakpoint width in pixels */
export const MOBILE_BREAKPOINT = 768;
