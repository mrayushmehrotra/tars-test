/**
 * ChatHeader — Presentational Component
 *
 * Displays conversation info at the top of the chat area:
 * - Back button (mobile, Feature 6)
 * - Avatar + name
 * - Online status (Feature 7)
 * - Group member count (Feature 14)
 */
"use client";

import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OnlineIndicator } from "@/components/indicators/OnlineIndicator";
import { ArrowLeft, Users } from "lucide-react";

/** Conversation with resolved member data */
interface ConversationWithMembers {
    _id: Id<"conversations">;
    isGroup: boolean;
    name?: string;
    members: Array<{
        _id: Id<"users">;
        name: string;
        avatarUrl: string;
        isOnline: boolean;
    }>;
    memberCount: number;
}

interface ChatHeaderProps {
    conversation: ConversationWithMembers;
    currentUserId: Id<"users">;
    onBack: () => void;
}

/**
 * Chat header with conversation info and mobile back button
 */
export function ChatHeader({
    conversation,
    currentUserId,
    onBack,
}: ChatHeaderProps) {
    /** For direct chats, get the other user */
    const otherUser = conversation.isGroup
        ? null
        : conversation.members.find((m) => m._id !== currentUserId);

    const displayName = conversation.isGroup
        ? conversation.name ?? "Group"
        : otherUser?.name ?? "Unknown";

    const avatarUrl = conversation.isGroup ? "" : otherUser?.avatarUrl ?? "";
    const initials = displayName.slice(0, 2).toUpperCase();
    const isOnline = conversation.isGroup ? false : otherUser?.isOnline ?? false;

    /** Status text for subtitle */
    const statusText = conversation.isGroup
        ? `${conversation.memberCount} members`
        : isOnline
            ? "Online"
            : "Offline";

    return (
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 glass-strong">
            {/* Back button — visible only on mobile */}
            <Button
                id="chat-back-btn"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="md:hidden h-9 w-9 rounded-xl flex-shrink-0"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                {conversation.isGroup ? (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-border/50">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                ) : (
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                )}

                {/* Online indicator for direct chats */}
                {!conversation.isGroup && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineIndicator isOnline={isOnline} />
                    </div>
                )}
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground truncate font-[family-name:var(--font-outfit)]">
                    {displayName}
                </h2>
                <p
                    className={`text-xs ${isOnline ? "text-emerald-400" : "text-muted-foreground"}`}
                >
                    {statusText}
                </p>
            </div>
        </div>
    );
}
