# FlowDesk Frontend

Modern React/Next.js web app for FlowDesk Team Task Manager.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Run development server
npm run dev
```

App available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `src/pages/` - Next.js pages and routing
- `src/components/` - Reusable React components
- `src/services/` - API client and service layer
- `src/stores/` - Zustand state management
- `src/styles/` - Tailwind CSS and globals
- `src/utils/` - Helper functions

## Pages

- `/auth` - Login/Register
- `/dashboard` - Overview dashboard
- `/projects` - Project list
- `/projects/[id]` - Project detail with Kanban board
- `/tasks` - User's tasks
- `/team` - Team management (Admin)
- `/settings` - User settings

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this to point to your backend API.

## Features

- 🎨 Light/Dark mode
- 📱 Responsive design
- ✓ Smooth animations
- 🔄 Auto token refresh
- 📡 Real-time updates
- 🔐 Protected routes

## Testing

Frontend can be tested manually. Automated testing setup ready for Jest/React Testing Library.

## Deployment

Static build can be:
1. Deployed to Vercel (recommended for Next.js)
2. Served by FastAPI backend
3. Deployed to Railway as separate service

### Build:
```bash
npm run build
```

Output in `.next/` and `out/` directories.

## Troubleshooting

**API connection refused**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Dark mode not working**: Clear browser cache and localStorage

**Auth loops**: Ensure backend is running and tokens are valid

**Build errors**: Delete `node_modules` and `.next`, then reinstall: `npm install && npm run build`
