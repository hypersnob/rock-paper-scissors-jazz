import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";
import { CreateGame } from "./CreateGame";
import { Dashboard } from "./Dashboard";
import { GamePage } from "./GamePage";

// Root route
const rootRoute = createRootRoute({
  component: App,
});

// Create game route
const createGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CreateGame,
});

// Game page route
const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$gameId",
  component: GamePage,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

// Create router
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    createGameRoute,
    gameRoute,
    dashboardRoute,
  ]),
});
