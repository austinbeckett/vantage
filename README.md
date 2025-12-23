# Vantage

A regulatory intelligence platform for pharmaceutical professionals monitoring Health Canada databases.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account with a project created

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and add your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase URL and publishable key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route page components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and API helpers
│   ├── supabase.ts # Supabase client
│   └── api/        # API functions
├── types/          # TypeScript type definitions
├── contexts/       # React contexts
└── App.tsx         # Main app with routing
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Implementation Roadmap

Follow the incremental milestones in `product-plan/instructions/incremental/`:

1. **Foundation** (current) - Design tokens, routing, shell
2. **Dashboard** - Activity feed, metrics
3. **Search & Discovery** - Database explorer
4. **Watchlists** - Surveillance management
5. **Competitive Intelligence** - Analytics hub
6. **Settings** - User preferences
7. **Help** - Knowledge base
