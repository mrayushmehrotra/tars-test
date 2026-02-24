/**
 * UserSearch — Container Component
 *
 * Provides user search functionality for starting new conversations.
 * Feature 2: User List & Search
 *
 * Data Flow: Search input → searchUsers query → UserSearchResults
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { OnlineIndicator } from "@/components/indicators/OnlineIndicator";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, X, UserSearch as UserSearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPTY_STATE_MESSAGES } from "@/lib/constants";

interface UserSearchProps {
    currentUser: Doc<"users">;
    onSelectUser: (userId: Id<"users">) => void;
    onClose: () => void;
}

/**
 * Searchable user list panel
 * Shows all users (excluding current) with real-time filtering
 */
export function UserSearch({
    currentUser,
    onSelectUser,
    onClose,
}: UserSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch users based on search term — real-time filtering
    const usersWithSearch = useQuery(
        api.users.searchUsers,
        searchTerm.trim() ? { searchTerm: searchTerm.trim(), currentUserId: currentUser._id } : "skip"
    );
    const usersWithoutSearch = useQuery(
        api.users.getAllUsers,
        { currentUserId: currentUser._id }
    );
    const users = searchTerm.trim() ? usersWithSearch : usersWithoutSearch;

    return (
        <div className="border-b border-border/50 animate-slide-up">
            {/* Search input */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="user-search-input"
                        placeholder="Search users by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-9 h-10 rounded-xl bg-card border-border/50 focus-visible:ring-primary/30"
                        autoFocus
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Search results */}
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {users === undefined ? (
                    // Loading state
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <div className="h-10 w-10 rounded-full animate-shimmer" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-24 rounded animate-shimmer" />
                                    <div className="h-2.5 w-16 rounded animate-shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-4">
                        <EmptyState
                            icon={UserSearchIcon}
                            title="No users found"
                            description={EMPTY_STATE_MESSAGES.NO_SEARCH_RESULTS}
                        />
                    </div>
                ) : (
                    <div className="p-2">
                        {users.map((user) => (
                            <button
                                key={user._id}
                                id={`user-item-${user._id}`}
                                onClick={() => onSelectUser(user._id)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-card/80 transition-colors duration-150"
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border border-border/50">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-0.5 -right-0.5">
                                        <OnlineIndicator isOnline={user.isOnline} />
                                    </div>
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
