/**
 * SidebarHeader — Presentational Component
 *
 * Displays:
 * - App logo/name
 * - Current user avatar and name
 * - Search toggle button
 * - Create group button
 * - Sign out button
 *
 * Feature 1: User name and avatar display
 */
"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { Search, Users, LogOut } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarHeaderProps {
    currentUser: Doc<"users">;
    onSearchClick: () => void;
    onGroupClick: () => void;
    isSearchOpen: boolean;
}

/**
 * Header section of the sidebar
 * Contains user info and action buttons
 */
export function SidebarHeader({
    currentUser,
    onSearchClick,
    onGroupClick,
    isSearchOpen,
}: SidebarHeaderProps) {
    /** Get user initials for avatar fallback */
    const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="p-4 border-b border-border/50">
            {/* Top row — App name + action buttons */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-foreground tracking-tight">
                    Tars<span className="text-primary">Chat</span>
                </h1>

                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        {/* Search users button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="search-users-btn"
                                    variant={isSearchOpen ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={onSearchClick}
                                    className="h-9 w-9 rounded-xl"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Find users</TooltipContent>
                        </Tooltip>

                        {/* Create group button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="create-group-btn"
                                    variant="ghost"
                                    size="icon"
                                    onClick={onGroupClick}
                                    className="h-9 w-9 rounded-xl"
                                >
                                    <Users className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>New group</TooltipContent>
                        </Tooltip>

                        {/* Sign out button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SignOutButton>
                                    <Button
                                        id="sign-out-btn"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </SignOutButton>
                            </TooltipTrigger>
                            <TooltipContent>Sign out</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* User profile row */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-card/50">
                <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {currentUser.email}
                    </p>
                </div>
            </div>
        </div>
    );
}
