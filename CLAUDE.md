# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Rock Paper Scissors game built with Jazz, React, and TypeScript. The app uses Jazz for real-time data synchronization and collaborative features, allowing users to create games and share them with others who can play remotely.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run format-and-lint` - Run Biome formatting and linting
- `npm run format-and-lint:fix` - Auto-fix formatting and linting issues

## Architecture

### Core Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Jazz (real-time sync, collaborative data structures)
- **Styling**: TailwindCSS + custom design system
- **Routing**: TanStack Router
- **UI Components**: Custom components built on Radix UI primitives
- **Code Quality**: Biome for formatting/linting, Playwright for E2E testing

### Jazz Data Model (src/schema.ts)
- **Game**: Contains host's move, optional comment, creation date, and a feed of plays
- **Play**: Represents a single round with player's move, winner, opponent account, and timestamp
- **AccountRoot**: Contains `myGames` (games user hosts) and `guestGames` (games user plays as guest)
- **JazzProfile**: User profile with name, visible to everyone
- **Move/Winner**: Zod enums for "ROCK"/"PAPER"/"SCISSORS" and "HOST"/"PLAYER"/"DRAW"

### Key Components Structure
- **App.tsx**: Main layout with PlayerName context, navigation, and auth
- **CreateGame.tsx**: Game creation interface where host selects move and optional comment
- **GamePage.tsx**: Game play interface with different views for host vs player
- **Dashboard.tsx**: List of user's hosted and guest games
- **MoveSelector.tsx**: Rock/Paper/Scissors selection component
- **MoveIcon.tsx**: Icon component for game moves

### Real-time Sync Architecture
- Games are shared via Jazz Groups with "writer" permissions for all participants
- Uses Jazz feeds (`co.feed(Play)`) to store and sync plays across accounts
- Complex feed subscription logic in GamePage.tsx handles real-time updates from multiple players
- Host can see all plays in real-time, players see results immediately after playing

### Authentication & Identity
- Uses Jazz's built-in passkey authentication
- Player names are editable and sync to Jazz profile
- Account migration in schema.ts ensures backward compatibility

### Routing Structure
- `/` - Create game page
- `/dashboard` - List of user's games
- `/$gameId` - Individual game page (handles both host and player views)

## Important Implementation Notes

### Jazz Feed Handling
The GamePage component has complex logic for handling Jazz feeds to ensure real-time updates work correctly. The feed subscription pattern uses both `perAccount` and `perSession` to catch all plays from all participants.

### Game State Management
- Games are created with host's move hidden from players
- Players make their move, which determines the winner
- Results are calculated using `determineWinner()` helper in `src/helpers/index.ts`
- Games can be archived but are not deleted by default

### Styling System
- Uses TailwindCSS with custom color tokens and animations
- Responsive design with mobile-first approach
- Custom font loading via @fontsource-variable/nunito-sans
- SVG icons imported as React components via Vite plugin