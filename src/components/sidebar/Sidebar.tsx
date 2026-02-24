/**
 * Sidebar — Container Component
 *
 * Contains:
 * - User header (name, avatar, logout)
 * - User search bar (Feature 2)
 * - New group button (Feature 14)
 * - Conversation list with unread counts
 *
 * Data Flow: useConversations hook → ConversationList
 *            useQuery(getAllUsers) → UserSearch
 */
"use client";

import { useState } from "react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useConversations } from "@/hooks/useConversations";
import { SidebarHeader } from "./SidebarHeader";
import { UserSearch } from "./UserSearch";
import { ConversationList } from "./ConversationList";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
    currentUser: Doc<"users">;
    selectedConversationId: Id<"conversations"> | null;
    onSelectConversation: (id: Id<"conversations">) => void;
}

/**
 * Sidebar container — manages conversation data fetching and user search
 */
export function Sidebar({
    currentUser,
    selectedConversationId,
    onSelectConversation,
}: SidebarProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const {
        conversations,
        isLoading,
        openDirectConversation,
        createGroupChat,
        markConversationAsRead,
    } = useConversations(currentUser._id);

    /**
     * Handle selecting a user from search results
     * Opens or creates a direct conversation
     */
    const handleSelectUser = async (userId: Id<"users">) => {
        const conversationId = await openDirectConversation(userId);
        onSelectConversation(conversationId);
        setIsSearchOpen(false);
    };

    /**
     * Handle selecting a conversation from the list
     * Marks it as read and updates selected state
     */
    const handleSelectConversation = async (
        conversationId: Id<"conversations">
    ) => {
        onSelectConversation(conversationId);
        await markConversationAsRead(conversationId);
    };

    /**
     * Handle creating a new group conversation
     */
    const handleCreateGroup = async (
        name: string,
        memberIds: Id<"users">[]
    ) => {
        const conversationId = await createGroupChat(name, memberIds);
        onSelectConversation(conversationId);
        setIsGroupDialogOpen(false);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header with user info and action buttons */}
            <SidebarHeader
                currentUser={currentUser}
                onSearchClick={() => setIsSearchOpen(!isSearchOpen)}
                onGroupClick={() => setIsGroupDialogOpen(true)}
                isSearchOpen={isSearchOpen}
            />

            {/* User search panel — slides in when search is active */}
            {isSearchOpen && (
                <UserSearch
                    currentUser={currentUser}
                    onSelectUser={handleSelectUser}
                    onClose={() => setIsSearchOpen(false)}
                />
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <ConversationList
                        conversations={conversations ?? []}
                        currentUserId={currentUser._id}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={handleSelectConversation}
                    />
                )}
            </div>

            {/* Create group dialog */}
            <CreateGroupDialog
                isOpen={isGroupDialogOpen}
                onClose={() => setIsGroupDialogOpen(false)}
                currentUser={currentUser}
                onCreateGroup={handleCreateGroup}
            />
        </div>
    );
}

/**
 * Skeleton loader for the sidebar conversation list
 * Feature 13: Loading states
 */
function SidebarSkeleton() {
    return (
        <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-36" />
                    </div>
                </div>
            ))}
        </div>
    );
}
