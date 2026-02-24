/**
 * Root Page — redirects authenticated users to /chat
 *
 * Unauthenticated users see a landing/sign-in prompt.
 * Authenticated users are redirected to the chat page.
 */
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/chat");
  }

  // Landing page for unauthenticated users
  redirect("/sign-in");
}
