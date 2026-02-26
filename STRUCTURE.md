# Memory Companion - Project Documentation

## 1. Overview
- **App Name:** Memory Companion
- **Purpose:** An AI-powered companion app for dementia/elderly patients, designed to be managed remotely by caregivers.
- **User Types:**
  - **Patients:** Access the app via a simple shareable code.
  - **Caregivers:** Create authenticated accounts to manage patient profiles, knowledge bases, and alerts.

## 2. Project Structure

```
/
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema definitions
│   ├── actions.ts       # All backend action flows
│   ├── auth.ts          # Convex Auth configuration
│   ├── auth.config.ts   # Auth provider config
│   ├── knowledgeBase.ts # KB query helpers
│   ├── familyMembers.ts # Family member query helpers
│   ├── patients.ts      # Patient query helpers
│   ├── conversations.ts # Conversation query helpers
│   ├── alerts.ts        # Alert query helpers
│   └── http.ts          # HTTP endpoints
├── src/
│   ├── App.tsx          # Route definitions
│   ├── main.tsx         # App entry point
│   ├── index.css        # Global styles
│   ├── pages/
│   │   ├── home.tsx           # Landing page
│   │   ├── companion.tsx      # Patient AI chat interface
│   │   ├── call.tsx           # Virtual voice call page
│   │   ├── dashboard.tsx      # Caregiver dashboard
│   │   ├── patient-setup.tsx  # Patient knowledge base & family setup
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   └── AudioVisualizer.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts
└── package.json
```

## 3. Routing (`src/App.tsx`)

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | `HomePage` | Public | Landing page with patient code entry and caregiver login |
| `/companion/:patientId` | `CompanionPage` | Public (via code) | AI text/voice chat for patients |
| `/call/:patientId` | `VirtualCallPage` | Public (via code) | Simulated voice call with AI family member |
| `/dashboard` | `DashboardPage` | Auth required | Caregiver overview and alerts |
| `/dashboard/patient/:patientId` | `PatientSetupPage` | Auth required | Manage knowledge base and family contacts |
| `*` | `NotFoundPage` | Public | 404 catch-all |

## 4. Pages & Key Functions

### `src/pages/home.tsx` — Landing Page
**Purpose:** Entry point for both patients and caregivers.
**State:** `patientCode`, `email`, `password`, `isSignInOpen`, `isLoading`, `error`, `authMode`
**Key Functions:**
- `handlePatientAccess()` — Navigates to `/companion/:patientId` using the entered patient code
- `handleAuth(e)` — Handles caregiver sign-in and sign-up using Convex Auth (`signIn("password", formData)`), then redirects to `/dashboard`
**Auth Components:** `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` from `convex/react`

### `src/pages/dashboard.tsx` — Caregiver Dashboard
**Purpose:** Shows patient overview and unresolved distress alerts for authenticated caregivers.
**State:** `patient`, `alerts`, `loading`, `showCreateForm`, `newPatientName`, `newPatientYear`, `newPatientNotes`, `saving`
**Convex Actions:**
- `loadDashboard` → fetches caregiver's patient list
- `loadAlerts` → fetches unresolved alerts
- `createPatient` → creates a new patient profile
- `resolveAlert` → marks an alert as resolved
**Key Functions:**
- `fetchDashboardData()` — Loads patient and alerts in sequence; sets `patient` state to first result
- `handleCreatePatient(e)` — Submits patient creation form, refreshes data
- `handleResolveAlert(alertId)` — Resolves an alert, refreshes alert list
- `handleSignOut()` — Signs out the caregiver and navigates to `/`

### `src/pages/companion.tsx` — Patient AI Companion
**Purpose:** Primary interface for the patient — text/voice AI chat with distress detection, family call initiation, and location lookup.
**State:** `messages`, `inputText`, `isThinking`, `isDistressed`, `caregiverId`, `isProfileLoading`, `showMap`, `userLocation`, `locationAddress`, `locationLoading`, `showFamilyTree`, `familyMembers`, `inputMode` (`"voice"` | `"text"`), `isRecording`, `isPlayingAudio`
**Refs:** `messagesEndRef`, `mediaRecorderRef`, `audioChunksRef`, `audioPlayerRef`, `recordingStartTimeRef`
**Convex Actions:**
- `chatAction` — Text-based AI chat (loads KB, runs AI, checks distress, triggers alert if needed)
- `loadFamilyAction` — Loads family members for the patient
- `voiceChatAction` — Voice-based AI chat (transcribes audio, runs AI, returns audio response)
**Key Functions:**
- `handleSendMessage(text)` — Sends a text message to the AI; handles multi-shape response; sets distress flag if detected
- `handleVoiceMessage(base64Audio, mimeType)` — Sends voice recording to AI; plays back audio response; updates transcript placeholder
- `handleCallMember(member)` — Navigates to `/call/:patientId` with `autoCallMember` state
- `handleWhereAmI()` — Gets geolocation, reverse-geocodes via Nominatim API, displays on map
- `startRecording()` — Requests mic access, creates MediaRecorder, starts recording in 250ms timeslices
- `stopRecording()` — Stops MediaRecorder; triggers `handleVoiceMessage`
**QuickAction Component:** Inline component for large tap-friendly action buttons (sends a preset message or calls an action)

### `src/pages/call.tsx` — Virtual Voice Call
**Purpose:** Simulates a real-time phone call using Voice Activity Detection (VAD) and AI-generated speech.
**Module-Level Constants:** `SILENCE_MS = 2000`, `SPEECH_THRESHOLD = 0.015`, `MIN_SPEECH_MS = 500`
**State:** `callState` (`'connecting' | 'ringing' | 'answering' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'failed'`), `selectedMember`, `callHistory`, `isSpeaking`, `micLevel`
**Refs:** `mountedRef`, `autoStartedRef`, `isAiSpeakingRef`, `isRecordingRef`, `audioCtxRef`, `analyserRef`, `animFrameRef`, `silenceTimerRef`, `speechStartRef`, `chunksRef`, `mediaRecorderRef`, `streamRef`, `audioRef`, `messagesEndRef`, `connectionTimeoutRef`, `memberRef`
**Convex Actions:**
- `callTurnAction` — Processes each call turn: transcribes audio (or opens call), runs AI, returns audio response
**Key Functions:**
- `handleStartCall(member)` — Kicks off the call: fires backend `isOpening: true` turn and VAD setup in parallel, shows ringing animation for 3s, then plays opening audio
- `setupVAD()` — Requests mic, creates Web Audio API chain (AudioContext → AnalyserNode → MediaRecorder), runs a `requestAnimationFrame` loop that detects speech vs. silence using RMS amplitude
- `sendToBackend(chunks, mimeType, member)` — Converts recorded audio blobs to base64, calls `callTurnAction`, plays returned audio via `playAudio()`
- `playAudio(base64Audio)` — Plays an MP3 from base64 string; sets `isAiSpeakingRef` to suppress VAD during playback
- `stopVAD()` — Cancels animation frame, clears timers, stops MediaRecorder
- `endCall(shouldNavigate)` — Full teardown: stops VAD, releases mic/audio streams, closes AudioContext, navigates back
**Demo Family Members:** `DEMO_FAMILY_MEMBERS` — exported array of 2 preset demo members (David & Sarah Wilson) with ElevenLabs voice IDs

### `src/pages/patient-setup.tsx` — Patient Configuration
**Purpose:** Caregiver UI to manage the patient's knowledge base (memories/facts) and family member calling profiles.
**State:** `knowledgeBase`, `familyMembers`, `loading`, form fields for KB (`kbCategory`, `kbQuestion`, `kbAnswer`, `kbOpen`), form fields for family (`famName`, `famRelation`, `famEmoji`, `famVoiceId`, `famScript`, `famOpen`), `copied`
**Convex Actions:**
- `loadKb` — Loads all knowledge base entries for the patient
- `addKb` — Creates a new KB entry
- `deleteKb` — Deletes a KB entry by ID
- `loadFam` — Loads all family members for the patient
- `addFam` — Creates a new family member with voice/persona config
**Key Functions:**
- `fetchData()` — Loads KB and family members in parallel with `Promise.all`
- `handleAddKb(e)` — Submits the new memory form; refreshes data
- `handleDeleteKb(entryId)` — Deletes a memory entry; refreshes data
- `handleAddFamily(e)` — Submits new family member form; refreshes data
- `copyLink()` — Copies the patient companion URL (`/companion/:patientId`) to clipboard with toast confirmation

## 5. Database Schema (`convex/schema.ts`)

| Collection | Fields | Description |
|---|---|---|
| `patients` | `name` (string), `caregiverId` (string), `birthYear?` (number), `notes?` (string) | Patient profiles created by caregivers |
| `knowledgeBase` | `patientId` (string), `caregiverId` (string), `category` (string), `question` (string), `answer` (string) | Memories/facts for AI context |
| `familyMembers` | `patientId` (string), `caregiverId` (string), `name` (string), `relationship` (string), `voiceId` (string), `greetingScript` (string), `avatarEmoji?` (string) | Virtual calling contacts with ElevenLabs voice config |
| `conversations` | `patientId` (string), `caregiverId` (string), `role` (string), `content` (string) | Chat message history |
| `alerts` | `patientId` (string), `caregiverId` (string), `triggerMessage` (string), `distressReason` (string), `resolved` (boolean) | Distress alerts triggered by AI |
| `authTables` | (Convex Auth reserved) | Authentication: users, sessions, accounts, etc. |

> All documents automatically include `_id` (document ID) and `_creationTime` (Unix ms timestamp) fields provided by Convex.

## 6. Backend Action Flows (`convex/actions.ts`)

| Action Export | Human Label | Flow Description |
|---|---|---|
| `processFlow_node_..._piig0fc` | Patient Chat | Input: `{patientId, caregiverId, patientMessage}` → Load KB → AI (companionAI) → Check distress (Code node) → [If distressed: Save alert + Return with `isDistressed: true`] / [Else: Return message] |
| `processFlow_node_..._omwuv8h` | Voice Chat | Input: `{patientId, caregiverId, base64Audio, mimeType}` → Transcribe (Whisper/STT) → Load KB → AI → Distress check → TTS audio response |
| `processFlow_node_..._fypfeut` | Call Turn | Input: `{base64Audio, mimeType, familyMemberName, relationship, voiceId, patientId, isOpening}` → Transcribe (if not opening) → Load KB → AI (as family member persona) → ElevenLabs TTS → Return `{responseText, audioBase64, transcript}` |
| `processFlow_node_..._8d0370z` | Load Dashboard | Input: `{}` → Query patients by caregiverId → Return patient list |
| `processFlow_node_..._pj1s0p7` | Load Alerts | Input: `{}` → Query alerts (unresolved, by caregiverId) → Return alert list |
| `processFlow_node_..._jk0p1qo` | Create Patient | Input: `{name, birthYear?, notes}` → Mutation: insert into `patients` → Return new patient |
| `processFlow_node_..._8ey2g96` | Resolve Alert | Input: `{alertId}` → Mutation: patch `alerts` to `resolved: true` → Return |
| `processFlow_node_..._ziisnms` | Load Knowledge Base | Input: `{patientId}` → Query `knowledgeBase` by patientId → Return entries |
| `processFlow_node_..._qpk7fjb` | Add KB Entry | Input: `{patientId, category, question, answer}` → Mutation: insert into `knowledgeBase` |
| `processFlow_node_..._lqo8rn4` | Delete KB Entry | Input: `{entryId}` → Mutation: delete from `knowledgeBase` |
| `processFlow_node_..._5mivrbu` | Load Family Members | Input: `{patientId}` → Query `familyMembers` by patientId → Return list |
| `processFlow_node_..._xc54svt` | Add Family Member | Input: `{patientId, name, relationship, voiceId, greetingScript, avatarEmoji}` → Mutation: insert into `familyMembers` |

## 7. AI Agent (`convex/agents/companionAI`)
- **Model:** Uses `generateObject` for structured output
- **Output Schema:** `{ message: string, isDistressed: boolean, distressReason?: string }`
- **System Prompt:** Configures the AI as a warm dementia companion that always answers consistently using the KB.
- **Usage:** Integrated into text chat, voice chat, and call turn flows.

## 8. Key Technologies

| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework and dev server |
| TypeScript | Type safety throughout |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | UI component library (Button, Card, Dialog, Tabs, Table, etc.) |
| Convex | Real-time backend (database, queries, mutations, actions) |
| `@convex-dev/auth` | Authentication (email/password) |
| ElevenLabs | Text-to-speech for virtual family member voices |
| Web Audio API | Voice Activity Detection (VAD) in call page |
| MediaRecorder API | Audio capture in companion and call pages |
| Nominatim (OpenStreetMap) | Reverse geocoding for "Where Am I" feature |
| Lucide React | Icon library |
| Sonner | Toast notifications |

## 9. Authentication Flow
1. **Caregiver Sign-Up/In:** `home.tsx` → `signIn("password", formData)` via `useAuthActions()` → Redirected to `/dashboard`
2. **Protected Routes:** `App.tsx` wraps `/dashboard` and `/dashboard/patient/:patientId` with `<Authenticated>` / `<Unauthenticated>` guards
3. **Caregiver Identity:** Backend actions retrieve `caregiverId` via `getAuthUserId(ctx)` from Convex Auth
4. **Patient Access:** Public — no auth required, only the patient's `_id` (used as a shareable code)

## 10. Key Types & Constants

**`call.tsx`:**
- `CallState`: `'connecting' | 'ringing' | 'answering' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'failed'`
- `FamilyMember`: `{ _id, name, relationship, avatarEmoji?, voiceId, greetingScript }`
- `CallTurn`: `{ role: 'patient' | 'ai', text: string }`
- `SILENCE_MS = 2000` — ms of silence before recording stops
- `SPEECH_THRESHOLD = 0.015` — RMS amplitude threshold to detect speech
- `MIN_SPEECH_MS = 500` — minimum ms of speech to send to backend

**`companion.tsx`:**
- `FamilyMember`: `{ _id, name, relationship, avatarEmoji?, voiceId?, greetingScript?, patientId?, caregiverId? }`
- `Message`: `{ role: 'patient' | 'assistant', content: string }`
