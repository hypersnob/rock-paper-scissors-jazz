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

// Play schema - represents a single play/round within a game
// Note: CoFeeds automatically track the creator via .by property, no need to store opponentAccount
export const Play = co.map({
  playerMove: Move,
  winner: Winner,
  datePlayed: z.string(),
  hostMoveSnapshot: Move.optional(), // Store host's move for historical record
});

export type PlayType = co.loaded<typeof Play>;

// Game schema - simplified to contain only host info and a feed of plays
export const Game = co.map({
  hostMove: Move,
  comment: z.string().optional(),
  dateCreated: z.string(),
  isArchived: z.boolean().optional(),
  plays: co.feed(Play),
});

export type GameType = co.loaded<typeof Game>;

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
  guestGames: co.optional(co.list(Game)),
});

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
      const myGamesList = co.list(Game).create([], account.$jazz.owner);
      const guestGamesList = co.list(Game).create([], account.$jazz.owner);
      account.$jazz.set("root", {
        myGames: myGamesList,
        guestGames: guestGamesList,
      });
    } else {
      // Ensure guestGames exists for accounts created before it was added to the schema
      await account.$jazz.ensureLoaded({
        resolve: { root: { guestGames: true } },
      });
      if (account.root && !account.root.$jazz.has("guestGames")) {
        const guestGamesList = co
          .list(Game)
          .create([], account.root.$jazz.owner);
        account.root.$jazz.set("guestGames", guestGamesList);
      }
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
          group
        )
      );
    }
  });
