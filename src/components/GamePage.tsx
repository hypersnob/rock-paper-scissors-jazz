import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useAccount, useCoState } from "jazz-tools/react";
import { useCallback, useState } from "react";
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

  // Load the actual game from Jazz
  const game = useCoState(Game, gameId);

  const navigate = useNavigate();

  const handlePlayerMove = useCallback(
    async (move: Move) => {
      if (!game || !me?.root || game.playerMove) return;

      try {
        // Calculate winner
        const winner = determineWinner(game.hostMove as Move, move);
        const dateCompleted = new Date().toISOString();

        // Update the game
        game.$jazz.set("playerMove", move);
        game.$jazz.set("winner", winner);
        game.$jazz.set("dateCompleted", dateCompleted);

        // Add to player's guest games if authenticated and list exists
        if (me.root.guestGames) {
          try {
            me.root.guestGames.$jazz.push(game);
          } catch (err) {
            console.error("Failed to add game to guestGames:", err);
          }
        }
      } catch (err) {
        console.error("Failed to submit move:", err);
      }
    },
    [game, me]
  );

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

  // Check if current user is host
  const isHost =
    me &&
    game.$jazz.owner.members.some(
      (m) => m.account?.$jazz?.id === me.$jazz.id && m.role === "admin"
    );

  const isCompleted = !!game.winner;
  const hasPlayerMove = !!game.playerMove;

  // Show completed game result
  if (isCompleted) {
    const isDraw = game.winner === "DRAW";
    const userWon = isDraw
      ? false
      : isHost
        ? game.winner === "HOST"
        : game.winner === "PLAYER";

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

  // Show waiting for player state (host view)
  if (isHost && !hasPlayerMove) {
    return (
      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-display font-black mb-3">
          Game Created!
        </h2>
        <p className="text-lg text-muted mb-6">
          Share this link with your opponent:
        </p>
        <div className="flex items-center gap-4 bg-white rounded-full px-6 py-4 text-primary-foreground">
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
