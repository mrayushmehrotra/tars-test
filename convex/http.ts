/**
 * Convex HTTP Router
 *
 * Handles incoming HTTP requests, specifically the Clerk webhook
 * for syncing user profiles from Clerk to the Convex users table.
 *
 * Webhook Flow: Clerk → POST /clerk-webhook → upsertUser mutation
 */
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 * Processes user.created and user.updated events from Clerk
 * Extracts user profile data and upserts into Convex users table
 */
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const eventType = body.type;

        // Only process user creation and update events
        if (eventType === "user.created" || eventType === "user.updated") {
            const userData = body.data;

            const clerkId = userData.id;
            const name =
                `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() ||
                "Anonymous";
            const email =
                userData.email_addresses?.[0]?.email_address ?? "";
            const avatarUrl = userData.image_url ?? "";

            await ctx.runMutation(api.users.upsertUser, {
                clerkId,
                name,
                email,
                avatarUrl,
            });
        }

        return new Response("OK", { status: 200 });
    }),
});

export default http;
