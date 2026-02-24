/**
 * Root Layout — Next.js App Router
 *
 * Wraps the entire application with:
 * - Google Fonts (Outfit + DM Sans)
 * - ConvexClientProvider (Clerk + Convex)
 * - Global styles (Tailwind)
 *
 * SEO: Proper title, meta description, and semantic HTML
 */
import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

/** Display font — used for headings and UI elements */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

/** Body font — used for message text and body content */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tars Chat — Real-time Messaging",
  description:
    "A real-time chat messaging application built with Next.js, Convex, and Clerk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
