/**
 * MessageList — Container/Presentational Hybrid
 *
 * Renders the scrollable list of messages with smart auto-scroll.
 * Feature 10: Smart Auto-Scroll
 *   - Auto-scroll to latest message when new messages arrive
 *   - If user scrolls up, do not force-scroll
 *   - Show "↓ New messages" button instead
 *
 * Feature 5: Empty state for no messages
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageItem } from "./MessageItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowDown } from "lucide-react";
import { EMPTY_STATE_MESSAGES } from "@/lib/constants";

/** Enriched message type from the getMessages query */
interface EnrichedMessage {
    _id: Id<"messages">;
    conversationId: Id<"conversations">;
    senderId: Id<"users">;
    body: string;
    createdAt: number;
    isDeleted: boolean;
    sender: {
        _id: Id<"users">;
        name: string;
        avatarUrl: string;
    } | null;
    reactions: Array<{
        _id: Id<"reactions">;
        messageId: Id<"messages">;
        userId: Id<"users">;
        emoji: string;
        userName: string;
    }>;
}

interface MessageListProps {
    messages: EnrichedMessage[];
    currentUserId: Id<"users">;
    isLoading: boolean;
    onDeleteMessage: (messageId: Id<"messages">) => Promise<void>;
    onToggleReaction: (messageId: Id<"messages">, emoji: string) => Promise<void>;
}

/**
 * Scrollable message list with smart auto-scroll behavior
 */
export function MessageList({
    messages,
    currentUserId,
    isLoading,
    onDeleteMessage,
    onToggleReaction,
}: MessageListProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);
    const prevMessageCountRef = useRef(messages.length);

    /**
     * Check if user is scrolled near the bottom
     * Threshold: within 100px of the bottom
     */
    const checkIfAtBottom = useCallback(() => {
        const el = scrollAreaRef.current;
        if (!el) return;

        const threshold = 100;
        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
        setIsAtBottom(atBottom);

        if (atBottom) {
            setShowNewMessageButton(false);
        }
    }, []);

    /**
     * Scroll to the bottom of the message list
     */
    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
        setShowNewMessageButton(false);
    }, []);

    /**
     * Smart auto-scroll logic:
     * - If user is at the bottom, auto-scroll on new messages
     * - If user has scrolled up, show "New messages" button
     */
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current) {
            // New message(s) arrived
            if (isAtBottom) {
                scrollToBottom();
            } else {
                setShowNewMessageButton(true);
            }
        }
        prevMessageCountRef.current = messages.length;
    }, [messages.length, isAtBottom, scrollToBottom]);

    // Initial scroll to bottom when messages first load
    useEffect(() => {
        if (messages.length > 0 && prevMessageCountRef.current === messages.length) {
            scrollToBottom(false);
        }
    }, [messages.length === 0]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return <MessageListSkeleton />;
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <EmptyState
                    icon={MessageCircle}
                    title="No messages yet"
                    description={EMPTY_STATE_MESSAGES.NO_MESSAGES}
                />
            </div>
        );
    }

    return (
        <div className="relative h-full">
            <div
                ref={scrollAreaRef}
                onScroll={checkIfAtBottom}
                className="h-full overflow-y-auto scrollbar-thin px-4 py-4"
            >
                <div className="space-y-1">
                    {messages.map((message) => (
                        <MessageItem
                            key={message._id}
                            message={message}
                            isOwnMessage={message.senderId === currentUserId}
                            currentUserId={currentUserId}
                            onDelete={() => onDeleteMessage(message._id)}
                            onToggleReaction={(emoji) =>
                                onToggleReaction(message._id, emoji)
                            }
                        />
                    ))}
                </div>
                <div ref={bottomRef} />
            </div>

            {/* "New messages" floating button — Feature 10 */}
            {showNewMessageButton && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Button
                        id="new-messages-btn"
                        onClick={() => scrollToBottom()}
                        className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 animate-bounce-subtle gap-1.5 px-4 h-9 text-xs font-medium"
                    >
                        <ArrowDown className="h-3.5 w-3.5" />
                        New messages
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * Skeleton loader for messages
 */
function MessageListSkeleton() {
    return (
        <div className="h-full p-4 space-y-4">
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
                            className={`h-14 rounded-2xl ${i % 2 === 0 ? "w-52" : "w-40"}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
