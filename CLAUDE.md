# Vibe PM

Personal project management app with a brutalist, code-editor aesthetic.

## Tech Stack

- **Framework**: Next.js 16.1.3 with App Router
- **UI**: React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Drag & Drop**: @dnd-kit

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/           # Next.js pages & routes
├── components/    # React components (all 'use client')
├── hooks/         # Custom hooks for data/state
├── lib/supabase/  # Supabase clients (client.ts, server.ts)
└── types/         # TypeScript definitions
```

## Key Patterns

- **Path alias**: `@/*` → `./src/*`
- **Data hooks**: `useTasks`, `useTodos`, `useDailyReflection`, `useSubtasks`
- **All components are client-side** (`'use client'` directive)
- **Supabase RLS**: All tables use Row Level Security filtered by `user_id`

## Database Tables

| Table | Purpose |
|-------|---------|
| `tasks` | Main tasks with status, priority, due dates |
| `todos` | Persistent quick notes (not date-specific) |
| `notes` | Daily reflections (one per user per day) |
| `subtasks` | Checklists within tasks |

Schema: `supabase-schema.sql`

## Types & Enums

```typescript
// Task status flow
type TaskStatus = 'backlog' | 'in-progress' | 'done'

// Priority levels
type Priority = 'low' | 'medium' | 'high' | 'urgent'
```

Full types in `/src/types/index.ts`

## Styling

- **Theme**: CSS variables in `globals.css` (dark/light mode)
- **Fonts**: IBM Plex Mono, IBM Plex Sans
- **Accent**: Orange (`--color-accent`)
- **Design**: Brutalist/terminal aesthetic with grid background

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Git

- Do not include `Co-Authored-By` lines in commit messages

## Verification

1. Run `npm run dev`
2. Open http://localhost:3000
3. Test task CRUD, drag-drop, view switching
