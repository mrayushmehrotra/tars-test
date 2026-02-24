/**
 * ConversationList — Presentational Component
 *
 * Renders the list of conversations in the sidebar.
 * Shows: avatar, name, latest message preview, unread badge, timestamp.
 *
 * Features: 3 (sidebar listing), 5 (empty state), 9 (unread badge)
 */
"use client";

import { Id } from "../../../convex/_generated/dataModel";
import { ConversationItem } from "./ConversationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";
import { EMPTY_STATE_MESSAGES } from "@/lib/constants";

/** Type for enriched conversation from getUserConversations query */
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

interface ConversationListProps {
    conversations: EnrichedConversation[];
    currentUserId: Id<"users">;
    selectedConversationId: Id<"conversations"> | null;
    onSelectConversation: (id: Id<"conversations">) => void;
}

/**
 * Renders conversation list or empty state
 */
export function ConversationList({
    conversations,
    currentUserId,
    selectedConversationId,
    onSelectConversation,
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <EmptyState
                icon={MessageSquare}
                title="No conversations"
                description={EMPTY_STATE_MESSAGES.NO_CONVERSATIONS}
            />
        );
    }

    return (
        <div className="p-2 space-y-0.5">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    isSelected={selectedConversationId === conversation._id}
                    onSelect={() => onSelectConversation(conversation._id)}
                />
            ))}
        </div>
    );
}
