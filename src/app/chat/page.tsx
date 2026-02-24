/**
 * Chat Page — Container Component
 *
 * Main chat interface that manages:
 * - Selected conversation state (lifted to layout level)
 * - Sidebar ↔ Chat area layout (responsive)
 * - Online status tracking
 *
 * Architecture: ChatPageContainer → ChatLayout → Sidebar + ChatArea
 */
"use client";

import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function ChatPage() {
    /** State lifted to layout level — manages selected conversation */
    const [selectedConversationId, setSelectedConversationId] =
        useState<Id<"conversations"> | null>(null);

    const { user, isLoading } = useAuthUser();

    // Track online/offline status for the current user
    useOnlineStatus(user?._id);

    if (isLoading || !user) {
        return <LoadingScreen />;
    }

    return (
        <ChatLayout
            currentUser={user}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
        />
    );
}
