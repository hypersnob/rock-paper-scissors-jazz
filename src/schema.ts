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
      account.$jazz.set("root", {
        myGames: [],
        guestGames: [],
      });
    } else {
      // Ensure guestGames exists for accounts created before it was added to the schema
      await account.$jazz.ensureLoaded({ resolve: { root: true } });
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
