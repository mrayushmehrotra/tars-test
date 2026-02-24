# Tars Full stack Engineer Internship Coding Challenge 2026 (Using AI-Assisted Tool is allowed)

## Overview

Build a real-time Live chat messaging web app using:

- Next.js (App Router)
- TypeScript
- Convex (backend, database, realtime)
- Clerk (authentication)
- use Bun as environment
- use Shadcn ui as component library
- use Tailwind CSS as styling
- use Lucide React for icons

After completing the app, record a short Loom video explaining your code.

AI-assisted development tools (Cursor, Claude Code, Windsurf, GitHub Copilot, Codex, etc.) are ALLOWED.
You must understand every line of code you submit.

---

## Required Tech Stack

You must use:

- Next.js (App Router)
- TypeScript
- Convex (backend, database, realtime)
- Clerk (authentication)
- use Bun as environment
- use Shadcn ui as component library
- use Tailwind CSS as styling

Styling:
- Tailwind CSS (base styling required)
- Optional Tailwind-based component libraries:
  - shadcn/ui (recommended)
  - Radix UI
  - Headless UI
  - Plain Tailwind

Convex, Clerk, and Vercel have free tiers.

---

## Functional Requirements (Mandatory: 1–10)

### 1. Authentication
- Set up Clerk
- Users can:
  - Sign up (email or social login)
  - Log in
  - Log out
- Display logged-in user's name and avatar
- Store user profiles in Convex so other users can discover them

### 2. User List & Search
- Show all registered users (excluding yourself)
- Add search bar filtering users by name in real time
- Clicking a user opens or creates a conversation

### 3. One-on-One Direct Messages
- Private conversations between users
- Real-time message updates using Convex subscriptions
- Sidebar listing all conversations
- Show preview of most recent message

### 4. Message Timestamps
- Today's messages: show time only (e.g., 2:34 PM)
- Older messages: show date + time (e.g., Feb 15, 2:34 PM)
- Messages from a different year: include the year

### 5. Empty States
Show helpful messages for:
- No conversations yet
- No messages in a conversation
- No search results
No blank screens

### 6. Responsive Layout
Desktop:
- Sidebar + chat area side by side

Mobile:
- Conversation list as default view
- Tapping conversation opens full-screen chat
- Back button to return
- Use Tailwind responsive breakpoints

### 7. Online/Offline Status
- Green indicator for users with app open
- Real-time updates when users go online/offline

### 8. Typing Indicator
- Show "Alex is typing..." or pulsing dots animation
- Disappear after ~2 seconds of inactivity
- Disappear when message is sent

### 9. Unread Message Count
- Badge on each conversation in sidebar
- Show number of unread messages
- Clear when conversation is opened
- Real-time updates

### 10. Smart Auto-Scroll
- Auto-scroll to latest message when new messages arrive
- If user scrolls up, do not force-scroll
- Show "↓ New messages" button instead

---

## Optional Features (11–14)

### 11. Delete Own Messages
- Users can delete their own messages
- Show: "This message was deleted" (italics)
- Soft delete (do not remove from Convex)

### 12. Message Reactions
- Fixed emoji set:
  👍 ❤️ 😂 😮 😢
- Clicking same reaction removes it
- Show reaction counts below message

### 13. Loading & Error States
- Skeleton loaders or spinners during loading
- If message fails to send:
  - Show error
  - Retry option
- Handle network/service errors gracefully

### 14. Group Chat
- Create group conversation
- Pick multiple members
- Give group a name
- Real-time messages for all members
- Show group name + member count in sidebar

---

## Video Explanation (Required)

Record a Loom video (5 minutes):

1. 30-second introduction about yourself
2. Camera must be on and face visible
3. Open code editor
4. Walk through one feature
5. Demo it working
6. Make a small live code change and show it reflected

Submissions without Loom video will NOT be reviewed.

---

## Evaluation Criteria

1. Features Completed
2. Code Quality
3. Schema Design (Convex tables structure)
4. UI/UX Polish
5. Presentation (clarity of explanation)

---

## Hosting & Submission

1. Push code to public GitHub repository
   - Commit frequently

2. Deploy app on Vercel (free tier)
   - Ensure deployed version works

3. Send email to:
   - vaibhav@hellotars.com
   - CC: vinit@hellotars.com

Subject:
Fullstack Intern Code Challenge Submission

Body:

Full Name:
Email:
Link to GitHub Repo:
Link to Vercel App:
Link to Loom Video:
Link to LinkedIn Profile:
AI-Assisted Coding Tool you used:

You can submit multiple times on the same email thread.
Latest submission will be considered.

---

## Notes

- Estimated time: 4–5 hours with AI tools
- Review response: 3–5 days after submission
- For questions:
  Email vaibhav@hellotars.com
  Subject: Query about Tars Code Challenge