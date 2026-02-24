/**
 * LoadingScreen — Full-screen loading state
 *
 * Displayed while authentication and initial data loads.
 * Features skeleton shimmer animation.
 */
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-in">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium text-sm tracking-wide">
                    Loading Tars Chat...
                </p>
            </div>
        </div>
    );
}
