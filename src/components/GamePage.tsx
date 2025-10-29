import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useAccount, useCoState } from "jazz-tools/react";
import { useCallback } from "react";
import { MoveSelector } from "@/components/MoveSelector";
import { Button } from "@/components/ui/button";
import { determineWinner } from "@/helpers";
import { Game, JazzAccount, type Move } from "@/schema";

export function GamePage() {
  const { gameId } = useParams({ from: "/$gameId" });
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });

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
      alert("Game link copied to clipboard!");
    } catch {
      alert(`Failed to copy link. Please copy manually: ${url}`);
    }
  };

  // Loading state
  if (game === undefined) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="py-12">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Game not found
  if (game === null) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-red-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Game Not Found
          </h3>
          <p className="text-red-600 mb-6">
            The game you're looking for doesn't exist or you don't have
            permission to view it.
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
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Game Created!</h2>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-lg font-medium mb-4">
              Share this link with your opponent:
            </p>
            <div className="bg-white border rounded-lg p-3 mb-4">
              <code className="text-sm break-all">{window.location.href}</code>
            </div>
            <button
              type="button"
              onClick={handleShareGame}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Copy Link
            </button>
          </div>
          <p className="mb-2">
            Your move: <strong>{game.hostMove}</strong>
          </p>
          {game.comment && (
            <p className="italic mb-4">Question: "{game.comment}"</p>
          )}
          <p className="text-gray-500">
            Waiting for your opponent to make their move...
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            View Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // Show player move selection (player view)
  if (!isHost && !hasPlayerMove) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">You've Been Challenged!</h2>
          <p className="mb-2">
            You've been invited to play Rock Paper Scissors
          </p>
          {game.comment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                The question is:
              </p>
              <p className="text-yellow-900 font-medium italic">
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
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-blue-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">
          Game Not Ready
        </h3>
        <p className="text-blue-600 mb-6">
          This game is not yet ready to play.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
