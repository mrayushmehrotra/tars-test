/**
 * ConversationItem — Presentational Component
 *
 * Displays a single conversation row in the sidebar.
 * Shows: avatar, name, latest message preview, unread count badge, timestamp.
 *
 * Features: 3 (recent message preview), 7 (online status), 9 (unread badge), 14 (group info)
 */
"use client";

import { memo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnlineIndicator } from "@/components/indicators/OnlineIndicator";
import { formatSidebarTimestamp } from "@/lib/dateFormatter";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { ConversationService } from "@/services/conversationService";

/** Type for enriched conversation from the query */
interface EnrichedConversation {
    _id: Id<"conversations">;
    isGroup: boolean;
    name?: string;
    createdAt: number;
    members: Array<{
        _id: Id<"users">;
        name: string;
        avatarUrl: string;
        isOnline: boolean;
    }>;
    latestMessage: {
        _id: Id<"messages">;
        body: string;
        createdAt: number;
        isDeleted: boolean;
        senderId: Id<"users">;
    } | null;
    latestMessageSender: {
        name: string;
    } | null;
    unreadCount: number;
    memberCount: number;
}

interface ConversationItemProps {
    conversation: EnrichedConversation;
    currentUserId: Id<"users">;
    isSelected: boolean;
    onSelect: () => void;
}

/**
 * Single conversation row with avatar, name, preview, and unread badge
 * Memoized to prevent unnecessary re-renders in the conversation list
 */
export const ConversationItem = memo(function ConversationItem({
    conversation,
    currentUserId,
    isSelected,
    onSelect,
}: ConversationItemProps) {
    /** For direct conversations, get the other user via ConversationService */
    const otherUser = conversation.isGroup
        ? null
        : ConversationService.getOtherUser(conversation.members, currentUserId);

    /** Display name via ConversationService */
    const displayName = ConversationService.getDisplayName(
        conversation,
        currentUserId
    );

    /** Avatar URL: other user's avatar for direct chats */
    const avatarUrl = conversation.isGroup ? "" : otherUser?.avatarUrl ?? "";

    /** Initials for avatar fallback */
    const initials = displayName.slice(0, 2).toUpperCase();

    /** Online status: only for direct conversations */
    const isOnline = conversation.isGroup ? false : otherUser?.isOnline ?? false;

    /** Build message preview text via ConversationService */
    const previewText = ConversationService.getMessagePreview(
        conversation.latestMessage,
        conversation.latestMessageSender?.name ?? null,
        conversation.isGroup
    );

    return (
        <button
            id={`conversation-${conversation._id}`}
            onClick={onSelect}
            className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150",
                isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-card/60 border border-transparent"
            )}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                {conversation.isGroup ? (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-border/50">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                ) : (
                    <Avatar className="h-12 w-12 border border-border/50">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                )}

                {/* Online indicator for direct conversations */}
                {!conversation.isGroup && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineIndicator isOnline={isOnline} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {displayName}
                    </p>
                    {conversation.latestMessage && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatSidebarTimestamp(conversation.latestMessage.createdAt)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                        className={cn(
                            "text-xs truncate",
                            conversation.latestMessage?.isDeleted
                                ? "italic text-muted-foreground/60"
                                : "text-muted-foreground"
                        )}
                    >
                        {previewText}
                    </p>

                    {/* Unread count badge */}
                    {conversation.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 font-bold flex-shrink-0">
                            {conversation.unreadCount}
                        </Badge>
                    )}
                </div>

                {/* Group member count */}
                {conversation.isGroup && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {conversation.memberCount} members
                    </p>
                )}
            </div>
        </button>
    );
});
