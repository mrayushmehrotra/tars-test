/**
 * OnlineIndicator — Presentational component
 *
 * Displays a green dot for online users with a subtle glow animation.
 * Used in user lists and conversation headers.
 * Feature 7: Online/Offline Status
 */
import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
    isOnline: boolean;
    size?: "sm" | "md";
    className?: string;
}

/**
 * Green pulsing dot when user is online, gray when offline
 * @param isOnline - Whether the user is currently online
 * @param size - Dot size variant
 */
export function OnlineIndicator({
    isOnline,
    size = "sm",
    className,
}: OnlineIndicatorProps) {
    return (
        <span
            className={cn(
                "rounded-full border-2 border-background block",
                size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5",
                isOnline
                    ? "bg-emerald-500 animate-pulse-glow"
                    : "bg-zinc-500",
                className
            )}
            aria-label={isOnline ? "Online" : "Offline"}
        />
    );
}
