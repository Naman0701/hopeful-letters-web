# Hopeful Letters — Frontend

Vite + React + Tailwind v4 client for the Hopeful Letters project. Talks to the
FastAPI backend in `../backend` and reads from MongoDB hosted in `../database`.

## Prerequisites

- Node.js 18+ (you have v20+ — perfect).
- A running backend at <http://127.0.0.1:8000> (see `../backend/README.md`).

## Run it

```bash
cd frontend
npm install
cp .env.example .env   # leave VITE_API_URL empty to use the dev proxy
npm run dev            # http://localhost:5173
```

Vite is configured to proxy `/api/*` requests to the backend, so you can leave
`VITE_API_URL` blank during development.

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

For a production build set `VITE_API_URL` to your deployed API origin:

```bash
VITE_API_URL=https://api.example.com npm run build
```

## Project layout

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api.js
    ├── index.css
    ├── components/
    │   ├── HelpBanner.jsx     # sticky crisis-helpline banner
    │   ├── StoryCard.jsx
    │   ├── StoryList.jsx
    │   └── SubmitForm.jsx
    └── data/
        └── helplines.js       # localized helplines — please customize
```

## A note on content

This is a sensitive subject. Submissions hit the backend with `approved=false`
by default and require manual review (see `../backend/README.md`). The frontend
only ever displays approved entries. Please keep messaging focused on
**survival and recovery** — never method or graphic detail.
