/**
 * ConvexClientProvider
 *
 * Wraps the application with ConvexProvider and ClerkProvider
 * to enable real-time subscriptions and authentication.
 *
 * Architecture: ClerkProvider → ConvexProviderWithClerk → App
 */
"use client";

import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

/** Initialize Convex client with the deployment URL */
const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

interface ConvexClientProviderProps {
    children: ReactNode;
}

/**
 * Root provider that initializes Clerk authentication
 * and Convex real-time backend connection
 */
export function ConvexClientProvider({
    children,
}: ConvexClientProviderProps) {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: "#10b981",
                    colorBackground: "#0a0a0f",
                    colorInputBackground: "#14141f",
                    colorText: "#e2e8f0",
                },
            }}
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
