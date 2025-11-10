import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";
import { About } from "./components/About";
import { CreateGame } from "./components/CreateGame";
import { Dashboard } from "./components/Dashboard";
import { GamePage } from "./components/GamePage";

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

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

// Create router
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    createGameRoute,
    gameRoute,
    dashboardRoute,
    aboutRoute,
  ]),
});
