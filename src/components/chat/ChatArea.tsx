/**
 * ChatArea — Container Component
 *
 * Main chat interface containing:
 * - Chat header (user/group info + online status)
 * - Message list with auto-scroll
 * - Typing indicator
 * - Message input
 *
 * Data Flow: useMessages hook → MessageList
 *            useTyping hook → TypingIndicator + MessageInput
 *            useConversations.getConversationById → ChatHeader
 */
"use client";

import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import { useConversations } from "@/hooks/useConversations";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { TypingIndicator } from "@/components/indicators/TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface ChatAreaProps {
    conversationId: Id<"conversations">;
    currentUser: Doc<"users">;
    onBack: () => void;
}

/**
 * Chat area container — fetches conversation details, messages, and typing status
 */
export function ChatArea({
    conversationId,
    currentUser,
    onBack,
}: ChatAreaProps) {
    // Fetch conversation details with member info
    const conversation = useQuery(api.conversations.getConversationById, {
        conversationId,
    });

    // Messages hook — provides messages and message operations
    const {
        messages,
        isLoading: isMessagesLoading,
        isSending,
        sendError,
        clearError,
        sendMessage,
        deleteMessage,
        toggleReaction,
    } = useMessages(conversationId, currentUser._id);

    // Typing hook — provides typing state and handlers
    const { typingUsers, handleTyping, stopTyping } = useTyping(
        conversationId,
        currentUser._id
    );

    // Mark conversation as read when entering
    const { markConversationAsRead } = useConversations(currentUser._id);

    useEffect(() => {
        markConversationAsRead(conversationId);
    }, [conversationId, markConversationAsRead]);

    /**
     * Handle sending a message
     * Clears typing indicator on send
     */
    const handleSendMessage = async (body: string) => {
        stopTyping();
        await sendMessage(body);
    };

    if (!conversation) {
        return <ChatAreaSkeleton />;
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Chat header — shows conversation info + back button on mobile */}
            <ChatHeader
                conversation={conversation}
                currentUserId={currentUser._id}
                onBack={onBack}
            />

            {/* Message list with auto-scroll */}
            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages ?? []}
                    currentUserId={currentUser._id}
                    isLoading={isMessagesLoading}
                    onDeleteMessage={deleteMessage}
                    onToggleReaction={toggleReaction}
                />
            </div>

            {/* Typing indicator */}
            <TypingIndicator typingUsers={typingUsers} />

            {/* Message input */}
            <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isSending={isSending}
                sendError={sendError}
                onClearError={clearError}
            />
        </div>
    );
}

/**
 * Skeleton loader for the chat area
 * Feature 13: Loading states
 */
function ChatAreaSkeleton() {
    return (
        <div className="h-full flex flex-col">
            {/* Header skeleton */}
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>

            {/* Messages skeleton */}
            <div className="flex-1 p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                    >
                        <div className="flex items-start gap-2">
                            {i % 2 === 0 && (
                                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            )}
                            <Skeleton
                                className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Input skeleton */}
            <div className="p-4 border-t border-border/50">
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
    );
}
