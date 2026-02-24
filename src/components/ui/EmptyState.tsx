/**
 * EmptyState — Reusable empty state component
 *
 * Displays a message with an optional icon for empty screens:
 * - No conversations
 * - No messages
 * - No search results
 * - No selected conversation
 *
 * Follows Feature 5: No blank screens
 */
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

/**
 * Presentational component for empty states
 * @param icon - Lucide icon component to display
 * @param title - Bold heading text
 * @param description - Descriptive text below
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-outfit)]">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
                {description}
            </p>
        </div>
    );
}
