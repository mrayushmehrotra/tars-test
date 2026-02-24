/**
 * Auth Layout
 *
 * Centers the Clerk auth components on the page with
 * a gradient background for visual polish.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            {/* Subtle gradient orbs for visual interest */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}
