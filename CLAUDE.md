# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project ARES: Robotics Engineering Simulator** - An interactive educational game teaching technical concepts (mechanics, electronics, signal processing) through narrative simulations for students.

## Development Commands

### Core Commands
- `npm run dev` - Start Next.js development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:init` - Initialize database tables (requires .env.local with POSTGRES_URL)
- Uses tsx to run TypeScript directly: `tsx src/lib/db-init.ts`

### Deployment
- `npm run deploy` - Build and deploy to GitHub Pages (static export)

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: Vercel Postgres (@vercel/postgres)
- **Styling**: Tailwind CSS v4
- **3D Graphics**: React Three Fiber (@react-three/fiber, @react-three/drei, three.js)
- **State Management**: Zustand (global game state)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: lucide-react

### Deployment Targets
The app supports two deployment modes (configured in `next.config.ts`):
1. **Vercel** (default): Full SSR with server actions and edge runtime
2. **GitHub Pages** (static export): Uses basePath `/robotics-engineering-simulator`

Environment detection:
- `isVercel` checks `VERCEL === "1"`
- Non-Vercel production builds use `output: "export"`
- BasePath is injected via `NEXT_PUBLIC_BASE_PATH` environment variable

### Path Aliases
TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to `./src/*`

### Directory Structure
```
/src
  /app
    page.tsx          # Main level loader/router
    actions.ts        # Server actions (login, tracking, admin)
    layout.tsx        # Root layout
    globals.css       # Global styles
    /admin
      page.tsx        # Admin dashboard (PIN: 1111)
  /components
    /levels           # Individual level components (Level0-6)
    /ui               # Reusable UI components
    GameTracker.tsx   # Event tracking component
  /lib
    db.ts             # Database connection (Vercel Postgres)
    db-init.ts        # Database schema initialization
    physicsEngine.ts  # Physics simulation engine (materials, deflection)
    basePath.ts       # Runtime basePath helper
    utils.ts          # Utility functions
  /store
    gameStore.ts      # Zustand global state
```

## Core Patterns

### Global State Management (Zustand)
The game uses Zustand (`src/store/gameStore.ts`) for global state:
- **Current level tracking**: `currentLevel` (0-6)
- **Credits system**: `credits` (game currency)
- **Level state**: `levelState` ('INTRO' | 'ACTIVE' | 'SUCCESS' | 'FAIL')
- **User info**: `userName`, `userId` (database ID)
- **Navigation history**: `stateHistory` array for back button functionality
  - `pushStateHistory()` - Save current state before navigation
  - `popStateHistory()` - Go back to previous state
  - Limited to 50 entries to prevent memory issues
- **Sub-steps**: `subStep` for multi-step levels

**Key methods**:
- `advanceLevel()` - Automatically saves current state to history before advancing
- `popStateHistory()` - Restores previous state (preferred over `previousLevel()`)
- `returnToDashboard()` - Save state and return to level 0

### Database Schema
Two tables (Vercel Postgres):
```sql
users:
  - id (SERIAL PRIMARY KEY)
  - name (VARCHAR UNIQUE, uppercase normalized)
  - created_at (TIMESTAMP)
  - last_active (TIMESTAMP)

progress:
  - id (SERIAL PRIMARY KEY)
  - user_id (FK to users, ON DELETE CASCADE)
  - level_id (INTEGER)
  - event_type (VARCHAR) -- 'LEVEL_START', 'LEVEL_COMPLETE', 'REFLECTION', etc.
  - payload (JSONB) -- Flexible event data
  - created_at (TIMESTAMP)
```

### Server Actions (src/app/actions.ts)
All database operations use server actions:
- `loginUser(name)` - Authenticate student (case-insensitive, uppercased)
- `trackEvent(userId, levelId, eventType, payload)` - Log user events
- `getAdminData(pin)` - Fetch all users and progress (PIN: '1111')
- `createUser(pin, name)` - Admin creates new student
- `deleteUser(pin, userId)` - Admin deletes student (cascade deletes progress)

### Event Tracking Pattern
**CRITICAL**: All new features must implement event tracking using `trackEvent()`:

```typescript
import { trackEvent } from '@/app/actions';

// Level start
await trackEvent(userId, levelId, 'LEVEL_START', {
  timestamp: new Date()
});

// User interaction
await trackEvent(userId, levelId, 'MATERIAL_SELECTED', {
  material: 'aluminium',
  reason: 'optimal weight-to-stiffness ratio'
});

// Level completion
await trackEvent(userId, levelId, 'LEVEL_COMPLETE', {
  attempts: 3,
  duration: 245 // seconds
});
```

Common event types: `LEVEL_START`, `LEVEL_COMPLETE`, `REFLECTION`, `SESSION_START`, `MATERIAL_SELECTED`, `SIMULATION_RUN`

### Navigation Pattern
**IMPORTANT**: Always implement clear back navigation to prevent users from getting stuck:

```typescript
// Option 1: Router-based
import { useRouter } from 'next/navigation';
const router = useRouter();
<button onClick={() => router.push('/')}>Zurück</button>

// Option 2: State-based (preferred for in-level navigation)
import { useGameStore } from '@/store/gameStore';
const { popStateHistory } = useGameStore();
<button onClick={popStateHistory}>Zurück</button>

// Option 3: Sub-step management
const [view, setView] = useState('main');
<button onClick={() => setView('main')}>Zurück</button>
```

### Level Structure
Each level component (Level0-6) should:
1. Use `useGameStore()` for state access
2. Track events at key milestones
3. Provide clear navigation (back buttons, next level)
4. Use `levelState` to manage INTRO → ACTIVE → SUCCESS/FAIL flow
5. Update credits with `addCredits()` / `removeCredits()`

### Physics Simulation
`src/lib/physicsEngine.ts` provides:
- Material definitions (steel, titanium, ABS, carbon, aluminum)
- Physics calculations (mass, deflection, stiffness)
- Simulation results with pass/fail criteria

## Development Guidelines

### UI/UX Standards
- **Design**: Dark mode (`bg-slate-950`), monospace fonts for technical data
- **Colors**: Cyan (`cyan-400`) for success, red for errors, yellow for warnings
- **Accessibility**: Use `<GlossaryTooltip>` component for technical terms
- **Responsive**: Mobile-first but optimized for desktop (complex simulations)

### Admin Portal Patterns
- Event logs use `renderEventPayload()` for clean display
- Implement filters for large datasets
- Confirmation dialogs for destructive actions
- Show loading states during async operations

### Code Quality
- TypeScript strict mode enabled
- Use server actions for all database operations
- Never expose database credentials in client code
- Lazy load level components for performance
- Use `'use client'` directive for client components
- Use `'use server'` directive for server actions

### Pedagogical Principles
- Each level tells a cohesive story
- Technical terms explained in context (glossary tooltips)
- "Jargon-busting": No unexplained terminology
- Fail states provide educational feedback, not just "wrong"

## Important Files
- `src/app/actions.ts` - All server actions (database operations)
- `src/store/gameStore.ts` - Global game state (Zustand)
- `src/lib/db-init.ts` - Database schema and initialization
- `src/app/page.tsx` - Main level router and game loop
- `next.config.ts` - Deployment configuration (Vercel vs GitHub Pages)

## Environment Variables
Required in `.env.local`:
- `POSTGRES_URL` - Vercel Postgres connection string

## Testing & Debugging
- Admin portal accessible at `/admin` (PIN: 1111)
- Secret keyboard shortcuts in game:
  - `Shift + Arrow Right` - Next level (desktop)
  - `Shift + Arrow Left` - Previous level (desktop)
  - 3-finger swipe - Navigate levels (mobile)
