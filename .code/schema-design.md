# Convex Schema Design
Tars Full stack Engineer Internship Coding Challenge 2026

This schema strictly supports only the features listed in the assignment.
No additional architecture decisions or extra entities are introduced.

---

# 1. users

Purpose:
- Store user profiles synced from Clerk
- Enable user discovery
- Support online/offline status

Fields:

- _id
- clerkId (string) — Clerk user ID
- name (string)
- email (string)
- avatarUrl (string)
- isOnline (boolean)
- lastSeen (number, timestamp)

Indexes:

- by_clerkId
- by_name

Used For:

- Authentication display (name + avatar)
- User list
- Search by name
- Online/offline indicator

---

# 2. conversations

Purpose:
- Store one-on-one and group conversations

Fields:

- _id
- isGroup (boolean)
- name (string | null) — required only for groups
- createdAt (number)

Indexes:

- by_createdAt

Used For:

- Sidebar conversation list
- Group chat support

---

# 3. conversationMembers

Purpose:
- Link users to conversations
- Track unread counts
- Track last read message

Fields:

- _id
- conversationId (Id<conversations>)
- userId (Id<users>)
- lastReadAt (number)

Indexes:

- by_conversationId
- by_userId
- by_user_conversation

Used For:

- Fetch user’s conversations
- Unread message count
- Clearing unread when conversation is opened
- Group member tracking

---

# 4. messages

Purpose:
- Store all chat messages
- Support soft delete
- Support timestamps
- Support reactions

Fields:

- _id
- conversationId (Id<conversations>)
- senderId (Id<users>)
- body (string)
- createdAt (number)
- isDeleted (boolean)

Indexes:

- by_conversationId
- by_conversation_createdAt

Used For:

- Real-time message display
- Timestamp formatting
- Soft delete ("This message was deleted")
- Smart auto-scroll
- Sidebar preview (latest message)

---

# 5. reactions

Purpose:
- Store emoji reactions per message

Fields:

- _id
- messageId (Id<messages>)
- userId (Id<users>)
- emoji (string) — allowed values:
  👍 ❤️ 😂 😮 😢

Indexes:

- by_messageId
- by_message_user

Used For:

- Message reactions
- Reaction counts
- Toggle reaction (remove if clicked again)

---

# 6. typingIndicators

Purpose:
- Support typing indicator feature

Fields:

- _id
- conversationId (Id<conversations>)
- userId (Id<users>)
- updatedAt (number)

Indexes:

- by_conversationId
- by_user_conversation

Used For:

- Show "User is typing..."
- Auto-expire after ~2 seconds of inactivity

---

# Online / Offline Handling

Online status is stored directly in:

users.isOnline (boolean)
users.lastSeen (timestamp)

Updated when:
- User connects
- User disconnects

Used for:
- Green online indicator
- Real-time status updates

---

# Unread Message Count Logic

Unread messages are calculated by:

messages.createdAt > conversationMembers.lastReadAt

When user opens conversation:
- Update conversationMembers.lastReadAt

No separate unread table is introduced.

---

# Soft Delete Logic

When user deletes own message:
- Set messages.isDeleted = true
- Do NOT remove record

Frontend must display:
"This message was deleted" (italics)

---

# Notes

- All timestamps are stored as numbers (Date.now())
- No extra tables beyond assignment requirements
- No additional metadata fields added
- No role system
- No permissions layer beyond user membership
- No pagination schema unless required by features
- No additional optimization fields

Schema strictly supports features 1–14 as defined in the PDF.