import type { Account } from "jazz-tools";
import type { GameType, Move, Winner } from "@/schema";

// Game utility functions

type GroupMember = {
  role: string;
  account?: Account;
};

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
  const d = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Helper to get the host's account ID from a game's owner
export function getHostAccountId(game: GameType): string | undefined {
  if (!game?.$jazz?.owner) return undefined;
  const members = game.$jazz.owner.members;
  return members.find((m: GroupMember) => m.role === "admin")?.account?.$jazz
    ?.id;
}
