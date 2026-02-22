# ADR - Advanced Dungeons and Rabbits

A React/TypeScript rebuild of **ADR (Adventure RPG v0.4.5)**, originally a PHP mod for phpBB2 forums.

## About

ADR was a browser-based RPG game that ran as a phpBB2 modification, letting forum users create characters, battle monsters, collect items, and interact with each other. This project is a full ground-up rebuild using a modern stack while preserving the original game mechanics and feel.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend:** Express, TypeScript, SQLite (better-sqlite3), Drizzle ORM
- **Shared:** Monorepo with shared game formulas and type definitions

## Features

- **Character System** — Create characters with 7 races, 10 classes, 4 elements, 3 alignments, and 6 stats (Might, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
- **Turn-Based Combat** — Battle monsters with attack, defend, magic, and flee options; XP and gold rewards; leveling system
- **Equipment & Inventory** — Weapons, armor, shields, helms, gloves, amulets, rings, and magic items with stat bonuses and level/stat restrictions
- **Shop System** — Buy and sell items across multiple shops with quality modifiers and sell-back pricing
- **Thief System** — Steal items from shops using a d20 + skill modifier system with difficulty classes based on item price
- **Jail System** — Failed steal attempts can land you in jail with time-based sentences and bail payments
- **Vault & Banking** — Deposit gold to earn 4% daily interest, take loans (15% one-time fee, 10-day repayment), live countdown timers
- **Stock Market** — Three tradeable stocks with dynamic price changes, portfolio tracking, and unrealized P&L
- **Skill System** — Mining, Stonecutting, Forging, Enchantment, Trading, and Thief skills with SP-based progression
- **Town Hub** — Central location for skill activities (mine ore, cut gems, forge items, enchant gear)
- **Item Forge** — Combine ores, gems, and enchantments to craft custom equipment
- **Chat** — Real-time chat with polling, `/me` emote support, and date grouping
- **Character Browser** — View all adventurers with search, expandable profiles, and combat records
- **Item Giving** — Transfer unequipped items between players

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Seed the Database

```bash
npx tsx server/src/db/seed.ts
```

### Run

```bash
# Start the API server (port 3001)
npx tsx server/src/index.ts

# Start the client dev server (port 5173)
npm run dev --workspace=client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
adr-react/
├── packages/shared/     # Shared types, constants, game formulas
│   └── src/
│       ├── formulas/    # Battle, economy, forge, leveling, thief calculations
│       └── types/       # TypeScript interfaces for all game entities
├── server/              # Express API server
│   └── src/
│       ├── db/          # Schema, seed data, DB connection
│       ├── routes/      # API route handlers
│       └── services/    # Business logic layer
└── client/              # React frontend
    └── src/
        ├── api/         # API client
        ├── components/  # Shared UI components
        ├── pages/       # Page components
        └── stores/      # Zustand state management
```

## Credits

Originally based on **ADR (Adventure RPG v0.4.5)** for phpBB2 by the ADR development team.
