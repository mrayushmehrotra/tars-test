/**
 * CreateGroupDialog — Container Component
 *
 * Dialog for creating a new group conversation.
 * Feature 14: Group Chat
 *
 * User selects multiple members and provides a group name.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateGroupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: Doc<"users">;
    onCreateGroup: (name: string, memberIds: Id<"users">[]) => Promise<void>;
}

/**
 * Dialog to create a new group conversation
 * Requires a group name and at least 2 members
 */
export function CreateGroupDialog({
    isOpen,
    onClose,
    currentUser,
    onCreateGroup,
}: CreateGroupDialogProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Id<"users">[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch all users except current user
    const users = useQuery(api.users.getAllUsers, {
        currentUserId: currentUser._id,
    });

    /**
     * Toggle member selection
     */
    const toggleMember = (userId: Id<"users">) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    /**
     * Handle group creation with validation
     */
    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length < 1) return;

        setIsCreating(true);
        try {
            await onCreateGroup(groupName.trim(), selectedMembers);
            // Reset form
            setGroupName("");
            setSelectedMembers([]);
        } finally {
            setIsCreating(false);
        }
    };

    /**
     * Reset form state when dialog closes
     */
    const handleClose = () => {
        setGroupName("");
        setSelectedMembers([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md glass-strong rounded-2xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                        <Users className="h-5 w-5 text-primary" />
                        Create Group Chat
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Group name input */}
                    <div className="space-y-2">
                        <Label htmlFor="group-name" className="text-sm font-medium">
                            Group Name
                        </Label>
                        <Input
                            id="group-name"
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="rounded-xl bg-card border-border/50 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Member selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Select Members ({selectedMembers.length} selected)
                        </Label>
                        <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1 rounded-xl border border-border/50 p-2">
                            {users?.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => toggleMember(user._id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                                        selectedMembers.includes(user._id)
                                            ? "bg-primary/10"
                                            : "hover:bg-card/60"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 border border-border/50">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-foreground flex-1 text-left truncate">
                                        {user.name}
                                    </span>
                                    {selectedMembers.includes(user._id) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        id="create-group-submit-btn"
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedMembers.length < 1 || isCreating}
                        className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isCreating ? "Creating..." : "Create Group"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
