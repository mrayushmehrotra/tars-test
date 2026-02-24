/**
 * TypingIndicator — Presentational component
 *
 * Displays "User is typing..." text with pulsing dots animation.
 * Feature 8: Typing Indicator
 */

interface TypingIndicatorProps {
    typingUsers: string[];
}

/**
 * Shows who is currently typing in the conversation
 * Displays pulsing dots animation alongside the user name(s)
 * @param typingUsers - Array of names of users who are typing
 */
export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    /** Build the typing text based on number of typers */
    const typingText =
        typingUsers.length === 1
            ? `${typingUsers[0]} is typing`
            : typingUsers.length === 2
                ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
                : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

    return (
        <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
            {/* Pulsing dots animation */}
            <div className="flex items-center gap-0.5">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
            <span className="text-xs text-muted-foreground italic">{typingText}</span>
        </div>
    );
}
