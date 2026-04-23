# TextLo

TextLo is a collaborative real-time text playground where users can write, edit, and share any text or content via shareable URLs (slugs). It supports real-time collaboration powered by Socket.io with a Monaco editor in the browser.

**Tech stack**: Express + Socket.io + MongoDB (Mongoose) + TypeScript + EJS templates.

**How it works**: Each unique slug maps to a store in MongoDB. When a user visits a slug URL, the server checks if the store exists — if not, it auto-creates one. Socket.io rooms are keyed by slug so all clients sharing the same slug see real-time edits. Content changes are debounced and persisted to the database on the server side.

## Plans

### Free Plan

- **Store auto-expiry**: Stores with `lastUpdateDate` older than 1 month are automatically deleted.
- **Public access**: All stores are publicly accessible. Anyone can visit a slug URL directly and the store opens automatically.

### Paid Plan

- **Private stores**: Store owners can mark stores as private and non-editable.
- **Extended retention**: Stores are retained until the plan expires, plus 1 month grace period.

## Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Unique user email |
| `password` | string | Hashed password |
| `plan` | enum | `free` (default) or `paid` |
| `planExpiresAt` | Date | Plan expiration date (null for free plan) |

### Store

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Unique store identifier |
| `content` | string | Stored content |
| `userId` | ObjectId | Owner user reference |
| `isPublic` | boolean | Visibility (default `true`) |
| `isEditable` | boolean | Editability (default `true`) |
| `plan` | enum | Plan at time of creation (`free` or `paid`) |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

## Access Rules

| Condition | Access |
|-----------|--------|
| Free plan + not owner + last updated > 1 month | Deleted automatically |
| Free plan | Always public, always editable |
| Paid plan + isPublic = false | Only owner can access |
| Paid plan + isEditable = false | Read-only (owner and others) |
| Paid plan expires | Store retained for 1 extra month, then deleted |

## API Routes

### Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Stores

- `GET /:slug` — Public read (auto-creates on first visit for unauthenticated users)
- `PUT /api/stores/:slug` — Update store content (requires auth + ownership or free plan)
- `PATCH /api/stores/:slug/visibility` — Toggle `isPublic` (requires auth + ownership + paid plan)
- `PATCH /api/stores/:slug/editability` — Toggle `isEditable` (requires auth + ownership + paid plan)
- `DELETE /api/stores/:slug` — Delete store (requires auth + ownership)
- `GET /api/stores` — List user's stores (requires auth)

### Admin

- `POST /api/admin/cleanup` — Trigger cleanup job (auto-runs periodically)

## Socket Events

- `join-room` — Join a store room (respects privacy: private stores only accessible by owner)
- `send-message` — Broadcast content update (blocked if `isEditable = false`)

## Cleanup Job

Runs periodically:

1. Delete all free-plan stores not updated in the last 1 month.
2. Delete paid-plan stores 1 month after plan expiration.