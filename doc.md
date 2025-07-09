# Sync-Scribe Codebase Documentation

## 1. Folder Structure

### Root Level
- **`app/`** - Next.js 16 App Router folder (React frontend)
- **`ws-server/`** - Node.js WebSocket server (Express-like, but pure WebSocket)
- **`lib/`** - Shared utility functions
- **`node_modules/`** - Dependencies
- **Config files** - `package.json`, `tsconfig.json`, `tailwind.config.ts`, etc.

### `app/` Structure
- **`app/page.tsx`** - Home page (landing/room creation)
- **`app/editor/[roomId]/page.tsx`** - Editor page (dynamic route)
- **`app/components/`** - React components
  - **`editor/`** - Editor-specific components
  - **`ui/`** - Reusable UI components (buttons, cards, inputs)
- **`app/lib/`** - Client-side utilities
  - `websocket-client.ts` - WebSocket connection handler
  - `store.ts` - Zustand state management
  - `export-pdf.ts`, `export-docx.ts` - Document export functions
- **`app/types/`** - TypeScript type definitions

### `ws-server/` Structure
- **`server.js`** - WebSocket server entry point
- **`room-manager.js`** - Room and user management logic

---

## 2. Pages & Important Functions

### Home Page (`app/page.tsx`)
**Purpose:** Landing page where users create or join rooms

**Key Functions:**
- `handleCreateRoom()` - Creates a new room via WebSocket, redirects to editor
- `handleJoinRoom()` - Validates room code and redirects to editor
- `initiateCreate()` / `initiateJoin()` - Shows username modal

**Flow:** User enters username → Creates/joins room → Redirects to `/editor/[roomId]`

---

### Editor Page (`app/editor/[roomId]/page.tsx`)
**Purpose:** Main collaborative document editor

**Key Functions:**
- `initializeConnection()` - Connects to WebSocket, joins room, sets up event handlers
- `handleDocumentUpdate()` - Sends document changes to server
- `handleCursorMove()` - Sends cursor position updates

**WebSocket Event Handlers:**
- `room-joined` - Receives user info and initial document
- `user-presence` - Updates list of users in room
- `document-update` - Receives document changes from other users
- `cursor-move` - Receives cursor positions from other users
- `error` - Handles connection/room errors

---

### Text Editor Component (`app/components/editor/text-editor.tsx`)
**Purpose:** Rich text editor using TipTap

**Key Functions:**
- `onUpdate` - Triggers when user types (sends to parent)
- `onSelectionUpdate` - Tracks cursor position (throttled to 100ms)

---

### WebSocket Client (`app/lib/websocket-client.ts`)
**Purpose:** Manages WebSocket connection to server

**Key Functions:**
- `connect()` - Establishes WebSocket connection
- `send()` - Sends messages to server
- `on()` - Registers event handlers
- `disconnect()` - Closes connection

---

### Store (`app/lib/store.ts`)
**Purpose:** Global state management (Zustand)

**Stores:**
- `users` - List of users in room
- `currentUser` - Current user info
- `document` - Current document content
- `roomId` - Current room ID
- `isConnected` - Connection status

**Key Functions:**
- `setUsers()` - Updates user list
- `setDocument()` - Updates document
- `updateUserCursor()` - Updates cursor position for a user

---

### WebSocket Server (`ws-server/server.js`)
**Purpose:** Handles all WebSocket connections and message routing

**Message Types Handled:**
- `create-room` - Creates new room, returns room ID
- `join` - Adds user to room, sends initial state
- `document-update` - Broadcasts document changes to all users
- `cursor-move` - Broadcasts cursor position to other users

**Key Flow:**
1. Client connects → Server stores connection
2. Client sends message → Server processes → Broadcasts to room
3. Client disconnects → Server removes user from room

---

### Room Manager (`ws-server/room-manager.js`)
**Purpose:** Manages rooms, users, and document state

**Key Functions:**
- `createRoom()` - Generates room code, creates room object
- `joinRoom()` - Validates room, adds user, assigns color
- `leaveRoom()` - Removes user, deletes room if empty
- `updateDocument()` - Updates room's document state
- `broadcastToRoom()` - Sends message to all users in room (except sender)
- `getUsersInRoom()` - Returns list of users in room

**Room Structure:**
- `id` - Room code (6 char alphanumeric)
- `users` - Array of user objects
- `document` - Current document content
- `maxUsers` - Maximum 4 users per room

---

## 3. Control Flow (Request Flow)

### Creating a Room
1. **User clicks "Create Room"** → `app/page.tsx` → `initiateCreate()`
2. **User enters username** → `handleCreateRoom()`
3. **WebSocket Client connects** → `websocket-client.ts` → `connect()`
4. **Client sends `create-room`** → WebSocket → `ws-server/server.js`
5. **Server processes** → `room-manager.js` → `createRoom()` → Returns room ID
6. **Server sends `room-created`** → Client receives → Redirects to `/editor/[roomId]`

### Joining a Room
1. **User enters room code** → `app/page.tsx` → `initiateJoin()`
2. **User enters username** → `handleJoinRoom()`
3. **Redirects to** → `/editor/[roomId]?username=...`
4. **Editor page loads** → `app/editor/[roomId]/page.tsx` → `initializeConnection()`
5. **WebSocket connects** → Client sends `join` message with `roomId` and `username`
6. **Server processes** → `room-manager.js` → `joinRoom()` → Validates room, adds user
7. **Server sends `room-joined`** → Client receives → Sets user, document, room ID
8. **Server broadcasts `user-presence`** → All users in room get updated user list

### Document Editing
1. **User types in editor** → `text-editor.tsx` → `onUpdate()` triggered
2. **Editor page receives** → `handleDocumentUpdate()` → Sends `document-update` via WebSocket
3. **Server receives** → `ws-server/server.js` → Updates room document
4. **Server broadcasts** → `room-manager.js` → `broadcastToRoom()` → Excludes sender
5. **Other clients receive** → `document-update` event → Updates editor content via store

### Cursor Movement
1. **User moves cursor** → `text-editor.tsx` → `onSelectionUpdate()` (throttled 100ms)
2. **Editor page receives** → `handleCursorMove()` → Sends `cursor-move` via WebSocket
3. **Server receives** → Broadcasts to other users in room
4. **Other clients receive** → `cursor-move` event → Updates cursor overlay

### User Leaves
1. **User closes tab/connection** → WebSocket `close` event
2. **Server detects** → `ws-server/server.js` → `leaveRoom()` called
3. **Room Manager** → Removes user, broadcasts updated `user-presence`
4. **Other clients** → See user removed from list

---

## 4. Technology Stack

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript
- **State:** Zustand
- **Editor:** TipTap (rich text editor)
- **Styling:** Tailwind CSS, Radix UI components
- **Backend:** Node.js WebSocket server (ws library)
- **Export:** jsPDF, html2canvas, docx library

---

## Quick Reference

**Important Files:**
- `app/page.tsx` - Home/landing
- `app/editor/[roomId]/page.tsx` - Editor page
- `app/lib/websocket-client.ts` - WebSocket connection
- `app/lib/store.ts` - Global state
- `ws-server/server.js` - WebSocket server
- `ws-server/room-manager.js` - Room logic

**Key Concepts:**
- Rooms are identified by 6-character codes (e.g., "ABC123")
- Max 4 users per room
- Real-time sync via WebSocket
- Document state stored in memory (not persisted)
- Each user gets a unique color for identification

