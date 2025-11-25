# FarPong

FarPong is a Farcaster miniapp that brings a fast-twitch twist to the classic Pong arcade experience. It combines Farcaster account auth, Base connectivity, and real-time gameplay loops so channels and frames can host drop-in matches without leaving the Farcaster client.

## Highlights

- Built for Farcaster Frames and miniapp surfaces with the official Farcaster SDK stack.
- Wallet-aware sessions that lean on Base + wagmi for onchain-ready interactions.
- Responsive Tailwind UI with shadcn components tuned for mobile-first casting.
- Structured for remixing: modular game logic, reusable UI primitives, and clean state management.

## Getting Started

> Prerequisites: Node.js 22+, pnpm 10+, an app key in the Farcaster Developer Console, and (optionally) Base testnet credentials for transaction-enabled features.

```bash
# install dependencies
pnpm install

# run local dev server
pnpm dev

# lint before pushing
pnpm lint

# build production bundle
pnpm build
```

Create a `.env.local` file based on the keys you receive from the Farcaster miniapp dashboard. Typical values:

```
NEXT_PUBLIC_FARCASTER_CLIENT_ID=...
NEXT_PUBLIC_FARCASTER_REDIRECT_URI=https://localhost:3000/api/auth/callback
MINIAPP_SIGNING_KEY=...
BASE_RPC_URL=...
```

## Architecture Notes

- `src/` contains the app shell, game scenes, and hooks wrapping Farcaster miniapp APIs.
- `public/` houses static assets, including future sprite art and sound effects.
- `@farcaster/miniapp-sdk`, `@farcaster/miniapp-node`, and `@coinbase/onchainkit` handle auth, session hydration, and Base connectivity.
- React Query and Zod help orchestrate async flows and input validation.

## Roadmap

- Hook up production Farcaster frame endpoints and guardrails.
- Polish game balance, power-up cadence, and latency smoothing.
- Add match history + simple onchain rewards tied to Base actions.
- Drop in QA automations (unit + frame integration tests).

## Contributing

Open an issue or ping @bedlam520 on Farcaster if you have ideas, want to test, or plan to remix the miniapp. Please keep the attribution requirements from the license when you ship derivatives.

## License

Released under the custom Attribution License found in `LICENSE`. You are free to remix, redistribute, and build on FarPong as long as you clearly credit BEDLAM520 Development and the FarPong project.
