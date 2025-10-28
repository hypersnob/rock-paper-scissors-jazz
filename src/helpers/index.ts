import { GameType, Move, Winner } from "@/schema";

// Game utility functions
export function getGameStatus(game: GameType) {
  if (game?.isArchived) return "ARCHIVED";
  if (game?.winner) return "COMPLETED";
  if (game?.playerMove) return "WAITING_FOR_RESULT";
  if (game?.hostMove) return "WAITING_FOR_PLAYER";
  return "CREATING";
}

export function determineWinner(hostMove: Move, playerMove: Move): Winner {
  if (hostMove === playerMove) return "DRAW";

  const winConditions: Record<Move, Move> = {
    ROCK: "SCISSORS",
    PAPER: "ROCK",
    SCISSORS: "PAPER",
  };

  return winConditions[hostMove] === playerMove ? "HOST" : "PLAYER";
}

export function formatGameDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper to get the host's account ID from a game's owner
export function getHostAccountId(game: GameType): string | undefined {
  if (!game?.$jazz?.owner) return undefined;
  const members = game.$jazz.owner.members;
  return members.find((m: any) => m.role === "admin")?.account?.$jazz?.id;
}
