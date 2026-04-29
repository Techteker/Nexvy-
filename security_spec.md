# Security Specification for Proxima News

## Data Invariants
1. A user profile is immutable except for earnings (updated by system/on news views) and name/avatar.
2. Only users with the role 'creator' can create news items.
3. A bookmark must reference a valid news ID.
4. A poll vote can only be cast once per user per poll.
5. News titles and summaries have strict size limits (Title: 200, Summary: 500 characters).

## The Dirty Dozen Payloads (Targeting Denial)

1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: A 'user' attempting to set their role to 'creator'.
3. **Ghost News**: Creating a news item without a summary or with an authorId that doesn't match the authenticated user.
4. **Infinite Strings**: Injecting a 1MB string into a news title.
5. **Vote Stuffing**: Attempting to update a poll option's votes directly without a subcollection constraint (if applicable).
6. **Relational Orphan**: Creating a bookmark for a news item that doesn't exist.
7. **Cross-User Bookmark**: User A attempting to write a bookmark into User B's subcollection.
8. **Stale Updates**: Updating a news item's `publishedTime` after it was already published.
9. **Shadow Fields**: Adding an `isVerified` boolean to a news item that isn't in the schema.
10. **Resource Exhaustion**: Creating 10,000 bookmarks in a single second (governed by rate limits, but schema helps).
11. **PII Leak**: Reading User B's email without being an admin or User B.
12. **Status Shortcut**: Moving a news item from 'draft' to 'published' without having the 'creator' role.

## Test Runner (Draft Logic)

```ts
// firestore.rules.test.ts (Conceptual)
// 1. GUEST should be denied all writes.
// 2. USER A should NOT be able to write to /users/userB.
// 3. USER A (role: user) should NOT be able to write to /news/item1.
// 4. USER A (role: creator) SHOULD be able to write to /news/item1 if authorId == userA.
// 5. USER A should NOT be able to update News.authorId.
```
