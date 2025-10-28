/**
 * Learn about schemas here:
 * https://jazz.tools/docs/react/schemas/covalues
 */

import { co, Group, z } from "jazz-tools";

// Game move types as Zod enums
export const Move = z.enum(["ROCK", "PAPER", "SCISSORS"]);
export type Move = z.infer<typeof Move>;

export const Winner = z.enum(["HOST", "PLAYER", "DRAW"]);
export type Winner = z.infer<typeof Winner>;

// Game schema - using Account references instead of string IDs
export const Game = co.map({
  hostMove: Move,
  playerMove: Move.optional(),
  winner: Winner.optional(),
  question: z.string().optional(),
  dateCreated: z.string(),
  dateCompleted: z.string().optional(),
  isArchived: z.boolean().optional(),
});

/** The account profile is an app-specific per-user public `CoMap`
 *  where you can store top-level objects for that user */
export const JazzProfile = co.profile({
  /**
   * Learn about CoValue field/item types here:
   * https://jazz.tools/docs/react/schemas/covalues#covalue-fielditem-types
   */
  name: z.string(),
});

/** The account root is an app-specific per-user private `CoMap`
 *  where you can store top-level objects for that user */
export const AccountRoot = co.map({
  myGames: co.list(Game),
  guestGames: co.list(Game),
});

// Game utility functions
export function getGameStatus(game: co.loaded<typeof Game>) {
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
export function getHostAccountId(
  game: co.loaded<typeof Game>,
): string | undefined {
  if (!game?.$jazz?.owner) return undefined;
  const members = game.$jazz.owner.members;
  return members.find((m: any) => m.role === "admin")?.account?.$jazz?.id;
}

export const JazzAccount = co
  .account({
    profile: JazzProfile,
    root: AccountRoot,
  })
  .withMigration(async (account) => {
    /** The account migration is run on account creation and on every log-in.
     *  You can use it to set up the account root and any other initial CoValues you need.
     */
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        myGames: [],
        guestGames: [],
      });
    }

    if (!account.$jazz.has("profile")) {
      const group = Group.create();
      group.addMember("everyone", "reader"); // The profile info is visible to everyone

      account.$jazz.set(
        "profile",
        JazzProfile.create(
          {
            name: "Anonymous Player",
          },
          group,
        ),
      );
    }
  });
