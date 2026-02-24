# STRICT IMPLEMENTATION CONTEXT
Tars Full stack Engineer Internship Coding Challenge 2026
(Using AI-Assisted Tool is allowed)

This project must strictly follow the official assignment PDF.

DO NOT:
- Add extra features
- Modify requirements
- Change tech stack
- Introduce features not listed (1–14)
- Create additional business logic outside assignment scope

Tech Stack is FIXED:
- Next.js (App Router)
- TypeScript
- Convex
- Clerk
- Tailwind CSS

Only features 1–10 are mandatory.
11–14 are optional.

------------------------------------------------------------------

# INFRASTRUCTURE & INDUSTRY-LEVEL CODE DESIGN RULES

This application must follow professional production-level architecture
while staying strictly within assignment requirements.

No unnecessary abstraction beyond features.

------------------------------------------------------------------

# 1. Architectural Principles

Follow these principles strictly:

- Single Responsibility Principle (SRP)
- Separation of Concerns
- Composition over inheritance
- Clear layering (UI → hooks → services → Convex)
- No business logic inside UI components
- No database logic inside presentation layer

Each file must have one responsibility only.

------------------------------------------------------------------

# 2. Project Structure (App Router)

Use App Router structure.

app/
  layout.tsx
  page.tsx
  (auth)/
  chat/

components/
  ui/
  chat/
  sidebar/
  messages/
  indicators/

hooks/
  useAuthUser.ts
  useConversations.ts
  useMessages.ts
  useTyping.ts
  useOnlineStatus.ts

services/
  conversationService.ts
  messageService.ts
  userService.ts
  reactionService.ts

lib/
  utils.ts
  dateFormatter.ts
  constants.ts

convex/
  schema.ts
  users.ts
  conversations.ts
  messages.ts
  reactions.ts
  typing.ts

No mixing of layers.

------------------------------------------------------------------

# 3. Component Design Rules

Each component must:

- Perform one single task
- Be reusable
- Be stateless where possible
- Receive data via props
- Not fetch data directly unless it is a container component

Pattern:

Container Component:
- Handles data fetching
- Calls hooks
- Passes data down

Presentational Component:
- Pure UI
- No Convex queries
- No business logic

Example separation:

ChatPageContainer
  → ChatLayout
    → Sidebar
    → MessageList
      → MessageItem
    → MessageInput

One responsibility per component.

------------------------------------------------------------------

# 4. OOP Principles in TypeScript

Even in functional React, apply OOP thinking:

- Use interfaces for domain models
- Define types for:
  User
  Conversation
  Message
  Reaction
- Encapsulate logic inside service classes when needed

Example structure:

class ConversationService {
  createConversation()
  getUserConversations()
}

class MessageService {
  sendMessage()
  deleteMessage()
  getMessages()
}

Services must not contain UI logic.

------------------------------------------------------------------

# 5. Design Patterns To Use

Use these patterns where applicable:

1. Repository Pattern
   - Convex queries/mutations act as data layer
   - Services act as repository abstraction

2. Factory Pattern
   - For conversation creation (direct vs group)

3. Observer Pattern
   - Convex subscriptions for real-time updates

4. Strategy Pattern
   - Timestamp formatting logic
     - Today
     - Older this year
     - Different year

5. Controlled Component Pattern
   - Message input field

6. State Lifting
   - Manage selected conversation at layout level

No unnecessary complex patterns beyond assignment needs.

------------------------------------------------------------------

# 6. State Management Rules

- Use React state only where necessary
- Server state handled via Convex
- Avoid duplicate state
- Derive unread count, do not store redundant state

No external state libraries allowed.

------------------------------------------------------------------

# 7. Real-Time Architecture

Convex subscriptions must handle:

- New messages
- Online/offline status
- Typing indicator
- Unread badge updates
- Reactions

UI must react automatically via subscription updates.

No polling.

------------------------------------------------------------------

# 8. Error & Loading Handling

Every async interaction must include:

- Loading state
- Error state
- Retry option (for message send failure)

No silent failures.

------------------------------------------------------------------

# 9. Performance & Clean Code Rules

- No prop drilling beyond 2 levels (use composition)
- Memoize heavy lists if necessary
- Keep message rendering optimized
- Avoid unnecessary re-renders
- Strict TypeScript typing
- No "any" type

------------------------------------------------------------------

# 10. Naming Conventions

Components:
PascalCase

Hooks:
useCamelCase

Services:
SomethingService

Convex files:
entityName.ts

Functions:
camelCase

Constants:
UPPER_SNAKE_CASE

------------------------------------------------------------------

# 11. Responsive Design Rules

- Tailwind breakpoints
- Desktop: sidebar + chat side by side
- Mobile: conversation list default
- Mobile full-screen chat with back button

No layout hacks.

------------------------------------------------------------------

# 12. No Scope Creep Policy

The AI must NOT:

- Add message editing
- Add file uploads
- Add push notifications
- Add read receipts beyond unread count logic
- Add pagination unless strictly required
- Add admin roles
- Add extra analytics
- Add testing frameworks
- Add CI/CD configs

Only implement what assignment specifies.

------------------------------------------------------------------

# 13. Video Presentation Alignment

Code structure must be explainable in 5 minutes:

- Clear separation
- Clean schema
- Obvious data flow
- One feature easily demoable
- Easy live modification during Loom demo

------------------------------------------------------------------


# 14. Comment Rule

- Add comments to explain the code
- Add comments to explain the function logic like this below

/** 
 * what this function will do
 * @param {number[]} nums
 * @return {number[]}
 */

- Add comments to explain the logic
- Add comments to explain the data flow
- Add comments to explain the architecture
- Add comments to explain the design

------------------------------------------------------------------

# FINAL RULE

This is a coding challenge, not a production SaaS.

Design professionally.
Implement minimally.
Stay within PDF.
No invention.
No expansion.
No interpretation beyond text.

End of Context.