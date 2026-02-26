# Database Schema Reference

The database schema is defined using TypeScript in `convex/schema.ts`. This file serves as the single source of truth for your data model.

Convex automatically handles migrations. When you modify `convex/schema.ts` and run `npx convex dev` or `npx convex deploy`, the changes are applied to your cloud database.

## Core Tables

### `patients`
Stores patient profiles managed by caregivers.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"patients">` | Auto-generated unique ID |
| `_creationTime` | `number` | Auto-generated timestamp |
| `name` | `string` | Patient's full name |
| `caregiverId` | `string` | ID of the caregiver who manages this patient |
| `birthYear` | `number` (optional) | Year of birth for context |
| `notes` | `string` (optional) | Additional notes or medical context |

### `knowledgeBase`
Stores Q&A pairs used by the AI companion to provide consistent answers.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"knowledgeBase">` | Auto-generated unique ID |
| `_creationTime` | `number` | Auto-generated timestamp |
| `patientId` | `string` | ID of the patient this entry belongs to |
| `caregiverId` | `string` | ID of the caregiver who created this entry |
| `category` | `string` | Category of the question (e.g., "Personal", "Family") |
| `question` | `string` | The question the patient might ask |
| `answer` | `string` | The specific answer the AI should give |

### `familyMembers`
Stores information about family members for virtual calls.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"familyMembers">` | Auto-generated unique ID |
| `_creationTime` | `number` | Auto-generated timestamp |
| `patientId` | `string` | ID of the patient |
| `caregiverId` | `string` | ID of the caregiver |
| `name` | `string` | Name of the family member |
| `relationship` | `string` | Relationship to the patient (e.g., "Son", "Daughter") |
| `voiceId` | `string` | ElevenLabs Voice ID for TTS synthesis |
| `greetingScript` | `string` | Opening script for virtual calls |
| `avatarEmoji` | `string` (optional) | Emoji representation of the family member |

### `conversations`
Logs chat and voice interactions between the patient and the AI.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"conversations">` | Auto-generated unique ID |
| `_creationTime` | `number` | Auto-generated timestamp |
| `patientId` | `string` | ID of the patient involved |
| `caregiverId` | `string` | ID of the caregiver monitoring |
| `role` | `string` | Who spoke: "patient" or "assistant" |
| `content` | `string` | The text content of the message |

### `alerts`
Stores distress alerts triggered by the AI when a patient seems confused or upset.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"alerts">` | Auto-generated unique ID |
| `_creationTime` | `number` | Auto-generated timestamp |
| `patientId` | `string` | ID of the patient |
| `caregiverId` | `string` | ID of the caregiver to notify |
| `triggerMessage` | `string` | The message that triggered the alert |
| `distressReason` | `string` | AI analysis of why the patient is distressed |
| `resolved` | `boolean` | Status of the alert (true if resolved) |

## Authentication Tables

The following tables are managed automatically by the `@convex-dev/auth` package and handles user sessions, accounts, and authentication flow.

- **`users`**: Stores user profiles (caregivers)
- **`authSessions`**: Active sessions
- **`authAccounts`**: Linked authentication accounts (Google, GitHub, Password, etc.)
- **`authRefreshTokens`**: Refresh tokens for long-lived sessions
- **`authVerificationCodes`**: Codes for email verification or password reset
- **`authVerifiers`**: Verifiers for PKCE flow

## Modifying the Schema

To add a new table or modify an existing one:

1. Open `convex/schema.ts`
2. Add a new `defineTable` entry or modify fields
   ```typescript
   export default defineSchema({
     // ... existing tables
     newTable: defineTable({
       title: v.string(),
       count: v.number(),
     }),
   });
   ```
3. Save the file.
4. Run `npx convex dev` to apply changes to your development database.
5. When ready to deploy, run `npx convex deploy`.
