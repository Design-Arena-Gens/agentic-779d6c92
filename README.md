# Nova AI Assistant

Nova is a multi-threaded, offline-first AI orchestration console built with Next.js. The assistant can operate entirely on embedded playbooks or switch to a hybrid online mode that calls OpenAI when credentials are available.

## Capabilities

- Spawn parallel threads with independent context and mode.
- Offline intelligence powered by a curated knowledge pack and heuristic retrieval.
- Hybrid online mode that falls back to offline reasoning if the upstream API fails.
- Persistent thread state via `localStorage`.
- Insight panel that surfaces matched playbooks, reasoning, and actionable steps.

## Quickstart

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and start orchestrating.

## Hybrid Mode Setup

Create `.env.local` and add:

```
OPENAI_API_KEY=sk-********************************
```

Rebuild the app or restart the dev server for the changes to take effect.

## Production

```bash
npm run build
npm start
```

Deploy to Vercel using the provided production token:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-779d6c92
```

## Additional Documentation

- Step-by-step operations: `docs/PROCEDURE.md`
- Offline knowledge pack: `data/offlineKnowledge.ts`
- Offline inference engine: `lib/offlineAgent.ts`
