import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useAccount, useCoState } from "jazz-tools/react";
import { useCallback, useEffect, useState } from "react";
import { MoveIcon } from "@/components/MoveIcon";
import { MoveSelector } from "@/components/MoveSelector";
import { Button } from "@/components/ui/button";
import { determineWinner } from "@/helpers";
import CheckIcon from "@/icons/Check.svg?react";
import CopyIcon from "@/icons/Copy.svg?react";
import LoadingIcon from "@/icons/Loader.svg?react";
import { Game, JazzAccount, type Move } from "@/schema";

export function GamePage() {
  const { gameId } = useParams({ from: "/$gameId" });
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: { guestGames: true } },
  });
  const [copied, setCopied] = useState(false);
  // Force re-render when plays change - helps ensure reactivity
  const [, setUpdateTrigger] = useState(0);

  const navigate = useNavigate();

  // Load the actual game from Jazz with plays feed
  const game = useCoState(Game, gameId, {
    resolve: { plays: { $each: true } },
  });

  // Get the latest play from current user
  const myLatestPlay = game?.plays?.byMe?.value;

  // Check if current user is host
  const isHost =
    me &&
    game?.$jazz?.owner?.members?.some(
      (m) => m.account?.$jazz?.id === me.$jazz.id && m.role === "admin"
    );

  // Add game to guestGames when a non-host player visits the game
  useEffect(() => {
    if (game && me?.root?.guestGames && !isHost && gameId) {
      // Check if game is already in the list
      const gameAlreadyInList = me.root.guestGames.some(
        (g) => g?.$jazz?.id === gameId
      );

      if (!gameAlreadyInList) {
        try {
          me.root.guestGames.$jazz.push(game);
        } catch (err) {
          console.error("Failed to add game to guestGames:", err);
        }
      }
    }
  }, [game, me, isHost, gameId]);

  const handlePlayerMove = useCallback(
    async (move: Move) => {
      if (!game || !me?.root || myLatestPlay) return;

      try {
        // Calculate winner
        const winner = determineWinner(game.hostMove as Move, move);
        const datePlayed = new Date().toISOString();

        // Use implicit Play creation - Jazz will handle ownership automatically
        // This ensures the Play inherits proper permissions from the game's group
        game.plays.$jazz.push({
          playerMove: move,
          winner,
          datePlayed,
          hostMoveSnapshot: game.hostMove,
        });

        // Add to player's guest games if authenticated and list exists
        if (me.root.guestGames) {
          try {
            // Check if game is already in the list
            const gameAlreadyInList = me.root.guestGames.some(
              (g) => g?.$jazz?.id === game.$jazz.id
            );

            if (!gameAlreadyInList) {
              me.root.guestGames.$jazz.push(game);
            }
          } catch (err) {
            console.error("Failed to add game to guestGames:", err);
          }
        }
      } catch (err) {
        console.error("Failed to submit move:", err);
      }
    },
    [game, me, myLatestPlay]
  );

  // Get all plays from all accounts - compute directly in render for reactivity
  // MUST be called before any early returns to ensure Jazz tracks subscriptions
  // Accessing feed data directly in render ensures Jazz reactivity works

  // Access plays feed structure - this creates subscription
  const playsFeed = game?.plays;
  const perAccount = playsFeed?.perAccount;
  const perSession = playsFeed?.perSession;

  // Build array of all plays from all accounts
  // We'll use perSession to get ALL entries, then group by account
  // This ensures we see entries from all accounts, even if perAccount doesn't list them yet
  const allPlays: Array<{
    play: NonNullable<typeof myLatestPlay>;
    accountId: string;
    accountFeed: NonNullable<typeof perAccount>[string] | undefined;
  }> = [];

  // First, try to get plays from perAccount (more efficient)
  if (perAccount) {
    for (const accountId in perAccount) {
      const accountFeed = perAccount[accountId];
      if (!accountFeed) continue;

      try {
        // Access .value to create subscription (even if unused, this creates the subscription)
        accountFeed.value;

        // Iterate through all entries from this account
        for (const entry of accountFeed.all) {
          const playValue = entry.value;
          if (playValue) {
            allPlays.push({
              play: playValue,
              accountId,
              accountFeed,
            });
          }
        }
      } catch (error) {
        console.error(`Error iterating feed for account ${accountId}:`, error);
      }
    }
  }

  // Also iterate through perSession to catch any accounts not yet in perAccount
  // This is a fallback to ensure we see all plays
  if (perSession) {
    const seenPlays = new Set<string>();
    // Add existing plays to seen set
    for (const play of allPlays) {
      seenPlays.add(play.play.datePlayed + play.play.playerMove);
    }

    for (const sessionId in perSession) {
      const sessionFeed = perSession[sessionId as keyof typeof perSession];
      if (!sessionFeed) continue;

      try {
        for (const entry of sessionFeed.all) {
          const playValue = entry.value;
          if (playValue) {
            const playKey = playValue.datePlayed + playValue.playerMove;
            // Only add if we haven't seen this play already
            if (!seenPlays.has(playKey)) {
              // Get account ID from the entry's by property or extract from sessionId
              const entryAccountId =
                entry.by?.$jazz?.id || (sessionId.split("_")[0] as string);
              const accountFeed =
                (entryAccountId && perAccount?.[entryAccountId]) || undefined;

              allPlays.push({
                play: playValue,
                accountId: entryAccountId,
                accountFeed: accountFeed as
                  | NonNullable<typeof perAccount>[string]
                  | undefined,
              });
              seenPlays.add(playKey);
            }
          }
        }
      } catch (error) {
        console.error(`Error iterating session feed ${sessionId}:`, error);
      }
    }
  }

  // Sort by date played (newest first)
  const sortedPlays = allPlays
    .filter(
      (
        p
      ): p is {
        play: NonNullable<typeof myLatestPlay>;
        accountId: string;
        accountFeed: NonNullable<typeof perAccount>[string];
      } => p.play != null
    )
    .sort(
      (a, b) =>
        new Date(b.play.datePlayed).getTime() -
        new Date(a.play.datePlayed).getTime()
    );

  const hasPlayerMove = !!myLatestPlay;
  const hasAnyPlay = sortedPlays.length > 0;

  // Subscribe to plays feed changes and force re-render
  useEffect(() => {
    if (!game?.plays) return;

    // Subscribe to the plays feed to detect changes
    const unsubscribe = game.plays.$jazz.subscribe(() => {
      // Force component to re-render when feed changes
      setUpdateTrigger((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, [game?.plays]);

  const handleShareGame = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Loading state
  if (game === undefined) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <LoadingIcon className="size-12 animate-spin" />
      </div>
    );
  }

  // Game not found
  if (game === null || game.isArchived) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-red-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Game {game?.isArchived ? "Archived" : "Not Found"}
          </h3>
          <p className="text-red-600 mb-6">
            {game?.isArchived
              ? "The game you're looking for has been archived."
              : "The game you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show player result after they play
  if (!isHost && myLatestPlay) {
    const isDraw = myLatestPlay.winner === "DRAW";
    const userWon = !isDraw && myLatestPlay.winner === "PLAYER";

    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {isDraw
              ? "🤝 It's a Draw!"
              : userWon
                ? "🎉 You Won!"
                : "😔 You Lost"}
          </h2>
        </div>

        <div className="flex gap-4">
          <Button asChild className="w-full">
            <Link to="/">Create New Game</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Host view - show share link and plays list
  if (isHost) {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-4xl lg:text-5xl font-display font-black mb-3">
            Game Created and is active!
          </h2>
          <p className="text-lg text-muted mb-6">
            Share this link with your opponents:
          </p>
          <div className="flex items-center gap-4 bg-white rounded-full px-6 py-4 text-primary-foreground mb-8">
            <div className="grow text-left">
              <input
                className="text-sm break-all bg-transparent border-none outline-none w-full"
                value={window.location.href}
                readOnly
                onFocus={(e) => e.target.select()}
              />
            </div>
            <button
              type="button"
              onClick={handleShareGame}
              className="transition-colors"
            >
              {copied ? (
                <CheckIcon className="size-6" />
              ) : (
                <CopyIcon className="size-6" />
              )}
            </button>
          </div>
        </div>

        {/* Plays List */}
        {hasAnyPlay ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">
              Plays ({sortedPlays.length})
            </h3>
            <div className="space-y-3">
              {sortedPlays.map(({ play, accountFeed }, index) => {
                if (!play) return null;

                // Get player account from the accountFeed's by property
                const playerAccount = accountFeed?.by;
                const playerName =
                  playerAccount?.profile?.name || "Anonymous Player";

                const isDraw = play.winner === "DRAW";
                const hostWon = !isDraw && play.winner === "HOST";
                const resultText = isDraw
                  ? "🤝 Draw"
                  : hostWon
                    ? "🎉 You Won"
                    : "😔 You Lost";

                return (
                  <div
                    key={`${play.datePlayed}-${index}`}
                    className="bg-accent rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-full text-secondary-foreground">
                          <MoveIcon move={play.playerMove} className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">{playerName}</p>
                          <p className="text-sm text-muted">
                            {new Date(play.datePlayed).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{resultText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted">
            No plays yet. Share the link to start playing!
          </p>
        )}
      </div>
    );
  }

  // Show player move selection (player view)
  if (!isHost && !hasPlayerMove) {
    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">You've Been Challenged!</h2>
          <p className="mb-2">
            You've been invited to play Rock Paper Scissors
          </p>
          {game.comment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Comment:
              </p>
              <p className="text-yellow-900 font-medium italic text-left">
                "{game.comment}"
              </p>
            </div>
          )}
        </div>

        <MoveSelector onMoveSelect={handlePlayerMove} />
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center">
      <div className="bg-blue-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">
          Game Not Ready
        </h3>
        <p className="text-blue-600 mb-6">
          This game is not yet ready to play.
        </p>
      </div>
    </div>
  );
}
