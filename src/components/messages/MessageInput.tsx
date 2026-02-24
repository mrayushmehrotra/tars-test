/**
 * MessageInput — Controlled Component
 *
 * Text input for sending messages with:
 * - Controlled input state (Feature 5: Controlled Component Pattern)
 * - Typing indicator on keypress (Feature 8)
 * - Send on Enter key or button click
 * - Error display with retry option (Feature 13)
 * - Send button with loading state
 */
"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, AlertCircle, RefreshCw, ArrowDownNarrowWideIcon, ArrowDown01, ArrowDown } from "lucide-react";

interface MessageInputProps {
    onSendMessage: (body: string) => Promise<void>;
    onTyping: () => void;
    isSending: boolean;
    sendError: string | null;
    onClearError: () => void;
}

/**
 * Message input with send button, typing events, and error handling
 */
export function MessageInput({
    onSendMessage,
    onTyping,
    isSending,
    sendError,
    onClearError,
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [lastFailedMessage, setLastFailedMessage] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    /**
     * Handle sending the message
     * Stores the message for retry on failure
     */
    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed || isSending) return;

        setLastFailedMessage(trimmed);
        setMessage("");
        onClearError();

        try {
            await onSendMessage(trimmed);
            setLastFailedMessage("");
        } catch {
            // Error is handled by the hook — restore message for retry
            setMessage(trimmed);
        }
    };

    /**
     * Handle keyboard events
     * Enter sends the message, Shift+Enter adds a new line
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /**
     * Handle input change — triggers typing indicator
     */
    const handleChange = (value: string) => {
        setMessage(value);
        if (value.trim()) {
            onTyping();
        }
    };

    /**
     * Retry sending the last failed message
     */
    const handleRetry = async () => {
        if (!lastFailedMessage) return;
        setMessage("");
        onClearError();
        try {
            await onSendMessage(lastFailedMessage);
            setLastFailedMessage("");
        } catch {
            setMessage(lastFailedMessage);
        }
    };

    return (
        <>

            <div className="border-t border-border/50 p-3">
                {/* Error banner with retry option — Feature 13 */}
                {sendError && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-slide-up">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="flex-1">{sendError}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRetry}
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                        </Button>
                    </div>
                )}

                {/* Input area */}

                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            id="message-input"
                            value={message}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full resize-none bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all scrollbar-thin max-h-32"
                            style={{
                                height: "auto",
                                minHeight: "48px",
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                            }}
                        />
                    </div>

                    {/* Send button */}
                    <Button
                        id="send-message-btn"
                        onClick={handleSend}
                        disabled={!message.trim() || isSending}
                        className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all duration-200 flex-shrink-0"
                    >
                        <SendHorizontal
                            className={`h-5 w-5 ${isSending ? "animate-pulse" : ""}`}
                        />
                    </Button>
                </div>
            </div>
        </>
    );
}
