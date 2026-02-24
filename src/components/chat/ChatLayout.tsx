/**
 * ChatLayout — Layout Component
 *
 * Manages the responsive layout for the chat interface:
 * - Desktop: Sidebar + Chat area side by side
 * - Mobile: Conversation list default, full-screen chat on selection
 *
 * Feature 6: Responsive Layout
 * State Lifting: selectedConversationId managed at page level
 */
"use client";

import { Id, Doc } from "../../../convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";
import { EMPTY_STATE_MESSAGES } from "@/lib/constants";

interface ChatLayoutProps {
    currentUser: Doc<"users">;
    selectedConversationId: Id<"conversations"> | null;
    onSelectConversation: (id: Id<"conversations"> | null) => void;
}

/**
 * Responsive chat layout component
 * Desktop: sidebar + chat side by side
 * Mobile: toggle between conversation list and full-screen chat
 */
export function ChatLayout({
    currentUser,
    selectedConversationId,
    onSelectConversation,
}: ChatLayoutProps) {
    return (
        <div className="h-screen flex overflow-hidden bg-background">
            {/* Subtle background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-3xl" />
            </div>

            {/* Sidebar — hidden on mobile when a conversation is selected */}
            <div
                className={`relative z-10 w-full md:w-[380px] md:min-w-[380px] md:block border-r border-border/50 ${selectedConversationId ? "hidden" : "block"
                    }`}
            >
                <Sidebar
                    currentUser={currentUser}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={onSelectConversation}
                />
            </div>

            {/* Chat Area — hidden on mobile when no conversation is selected */}
            <div
                className={`relative z-10 flex-1 md:block ${selectedConversationId ? "block" : "hidden"
                    }`}
            >
                {selectedConversationId ? (
                    <ChatArea
                        conversationId={selectedConversationId}
                        currentUser={currentUser}
                        onBack={() => onSelectConversation(null)}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState
                            icon={MessageSquare}
                            title="Welcome to Tars Chat"
                            description={EMPTY_STATE_MESSAGES.NO_SELECTED_CONVERSATION}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
