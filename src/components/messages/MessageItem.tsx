/**
 * MessageItem — Presentational Component
 *
 * Renders a single message bubble with:
 * - Sender avatar + name (for received messages)
 * - Message body or "This message was deleted" (Feature 11)
 * - Timestamp (Feature 4)
 * - Reaction bar (Feature 12)
 * - Delete action with confirmation dialog (Feature 11)
 * - Slide-in animation
 */
"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatMessageTimestamp } from "@/lib/dateFormatter";
import { ALLOWED_REACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Trash2, SmilePlus, AlertTriangle } from "lucide-react";
import { MessageService } from "@/services/messageService";
import { ReactionService } from "@/services/reactionService";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

/** localStorage key for persisting the "Don't ask again" preference */
const SKIP_DELETE_CONFIRM_KEY = "tars-chat-skip-delete-confirm";

/** Enriched message type */
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

interface MessageItemProps {
    message: EnrichedMessage;
    isOwnMessage: boolean;
    currentUserId: Id<"users">;
    onDelete: () => Promise<void>;
    onToggleReaction: (emoji: string) => Promise<void>;
}

/**
 * Single message bubble with actions
 * Memoized to prevent unnecessary re-renders in the message list
 */
export const MessageItem = memo(function MessageItem({
    message,
    isOwnMessage,
    currentUserId,
    onDelete,
    onToggleReaction,
}: MessageItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isReactionOpen, setIsReactionOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [skipConfirm, setSkipConfirm] = useState(false);

    /** Load the "Don't ask again" preference from localStorage on mount */
    useEffect(() => {
        const stored = localStorage.getItem(SKIP_DELETE_CONFIRM_KEY);
        if (stored === "true") {
            setSkipConfirm(true);
        }
    }, []);

    /** Group reactions by emoji using MessageService */
    const reactionGroups = MessageService.groupReactions(
        message.reactions,
        currentUserId
    );

    /** Get sender initials using MessageService */
    const senderInitials = message.sender
        ? MessageService.getInitials(message.sender.name)
        : "?";

    /**
     * Handle delete button click
     * If "Don't ask again" was previously checked, delete immediately
     * Otherwise, show the confirmation dialog
     */
    const handleDeleteClick = useCallback(() => {
        if (skipConfirm) {
            onDelete();
        } else {
            setIsDeleteDialogOpen(true);
        }
    }, [skipConfirm, onDelete]);

    /**
     * Confirm deletion from the dialog
     * Saves the "Don't ask again" preference to localStorage if checked
     */
    const handleConfirmDelete = useCallback(async () => {
        setIsDeleting(true);

        if (dontAskAgain) {
            localStorage.setItem(SKIP_DELETE_CONFIRM_KEY, "true");
            setSkipConfirm(true);
        }

        try {
            await onDelete();
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setDontAskAgain(false);
        }
    }, [dontAskAgain, onDelete]);

    return (
        <>
            <div
                className={cn(
                    "group flex gap-2 animate-message-in py-1",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Avatar — only for received messages */}
                {!isOwnMessage && (
                    <Avatar className="h-8 w-8 flex-shrink-0 border border-border/50 mt-1">
                        <AvatarImage
                            src={message.sender?.avatarUrl}
                            alt={message.sender?.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                            {senderInitials}
                        </AvatarFallback>
                    </Avatar>
                )}

                <div
                    className={cn(
                        "max-w-[70%] flex flex-col",
                        isOwnMessage ? "items-end" : "items-start"
                    )}
                >
                    {/* Sender name — only for received messages */}
                    {!isOwnMessage && message.sender && (
                        <span className="text-[10px] text-muted-foreground/60 ml-1 mb-0.5 font-medium">
                            {message.sender.name}
                        </span>
                    )}

                    {/* Message bubble */}
                    <div className="relative">
                        <div
                            className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                                message.isDeleted
                                    ? "italic text-muted-foreground/60 bg-card/30 border border-border/30"
                                    : isOwnMessage
                                        ? "bg-primary text-primary-foreground rounded-tr-md"
                                        : "bg-card border border-border/50 text-foreground rounded-tl-md"
                            )}
                        >
                            {message.isDeleted
                                ? "This message was deleted"
                                : message.body}
                        </div>

                        {/* Action buttons — visible on hover, only for non-deleted messages */}
                        {!message.isDeleted && (isHovered || isReactionOpen) && (
                            <div
                                className={cn(
                                    "absolute top-0 flex items-center gap-0.5 -mt-1",
                                    isOwnMessage ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
                                )}
                            >
                                {/* Reaction picker */}
                                <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full bg-card/80 border border-border/50 hover:bg-card"
                                        >
                                            <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-2 rounded-xl glass-strong border-border/50"
                                        side={isOwnMessage ? "left" : "right"}
                                    >
                                        <div className="flex gap-1">
                                            {ALLOWED_REACTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        onToggleReaction(emoji);
                                                        setIsReactionOpen(false);
                                                    }}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors text-base"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Delete button — only for own messages, opens confirmation */}
                                {isOwnMessage && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleDeleteClick}
                                        className="h-7 w-7 rounded-full bg-card/80 border border-border/50 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reactions display */}
                    {Object.keys(reactionGroups).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-1">
                            {Object.values(reactionGroups).map((group) => (
                                <button
                                    key={group.emoji}
                                    onClick={() => onToggleReaction(group.emoji)}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border",
                                        group.hasReacted
                                            ? "bg-primary/15 border-primary/30 text-foreground"
                                            : "bg-card/60 border-border/50 text-muted-foreground hover:bg-card"
                                    )}
                                    title={ReactionService.formatReactedUsers(group.users)}
                                >
                                    <span>{group.emoji}</span>
                                    <span className="font-medium">{group.count}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/50 mt-0.5 mx-1">
                        {formatMessageTimestamp(message.createdAt)}
                    </span>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm glass-strong rounded-2xl border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-[family-name:var(--font-outfit)]">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Message
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Message preview */}
                    <div className="px-3 py-2 rounded-xl bg-card/50 border border-border/30 text-sm text-muted-foreground italic truncate">
                        &ldquo;{message.body.length > 80 ? message.body.slice(0, 80) + "…" : message.body}&rdquo;
                    </div>

                    {/* Don't ask again checkbox */}
                    <label
                        htmlFor={`dont-ask-${message._id}`}
                        className="flex items-center gap-2 cursor-pointer group/check"
                    >
                        <input
                            type="checkbox"
                            id={`dont-ask-${message._id}`}
                            checked={dontAskAgain}
                            onChange={(e) => setDontAskAgain(e.target.checked)}
                            className="h-4 w-4 rounded border-border/50 bg-card text-primary focus:ring-primary/30 accent-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground group-hover/check:text-foreground transition-colors">
                            Don&apos;t ask me again
                        </span>
                    </label>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDontAskAgain(false);
                            }}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            id="confirm-delete-btn"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});

