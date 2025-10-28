import { useNavigate, useParams } from "@tanstack/react-router";
import { useAccount, useCoState } from "jazz-tools/react";
import { useState } from "react";
import { determineWinner, formatGameDate } from "@/helpers";
import { Game, JazzAccount, type Move } from "@/schema";

const MOVES: { move: Move; emoji: string; label: string }[] = [
  { move: "ROCK", emoji: "🪨", label: "Rock" },
  { move: "PAPER", emoji: "📄", label: "Paper" },
  { move: "SCISSORS", emoji: "✂️", label: "Scissors" },
];

export function GamePage() {
  const { gameId } = useParams({ from: "/$gameId" });
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });

  // Load the actual game from Jazz
  const game = useCoState(Game, gameId);

  const navigate = useNavigate();
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayerMove = async () => {
    if (!selectedMove || !game || !me?.root || game.playerMove) return;

    setIsSubmitting(true);

    try {
      // Calculate winner
      const winner = determineWinner(game.hostMove as Move, selectedMove);
      const dateCompleted = new Date().toISOString();

      // Update the game
      game.$jazz.set("playerMove", selectedMove);
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
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="text-gray-600">Loading game...</p>
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
          <p className="text-gray-600 mb-6">
            Game completed{" "}
            {game.dateCompleted ? formatGameDate(game.dateCompleted) : ""}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Game Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Host's Move:</span>
              <span className="font-medium">
                {MOVES.find((m) => m.move === game.hostMove)?.emoji}{" "}
                {game.hostMove}
              </span>
            </div>
            {game.playerMove && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Player's Move:</span>
                  <span className="font-medium">
                    {MOVES.find((m) => m.move === game.playerMove)?.emoji}{" "}
                    {game.playerMove}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Result:</span>
                  <span className="font-medium">{game.winner}</span>
                </div>
              </>
            )}
            {game.question && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-gray-600 mb-2">Question:</p>
                <p className="font-medium italic">"{game.question}"</p>
                {!isDraw && !userWon && (
                  <p className="text-sm text-gray-500 mt-2">
                    Time to answer the question! 😄
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Create New Game
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </button>
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
              <code className="text-sm text-gray-600 break-all">
                {window.location.href}
              </code>
            </div>
            <button
              type="button"
              onClick={handleShareGame}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Copy Link
            </button>
          </div>
          <p className="text-gray-600 mb-2">
            Your move:{" "}
            <strong>
              {MOVES.find((m) => m.move === game.hostMove)?.emoji}{" "}
              {game.hostMove}
            </strong>
          </p>
          {game.question && (
            <p className="text-gray-600 italic mb-4">
              Question: "{game.question}"
            </p>
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
          <p className="text-gray-600 mb-2">
            You've been invited to play Rock Paper Scissors
          </p>
          {game.question && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                The question is:
              </p>
              <p className="text-yellow-900 font-medium italic">
                "{game.question}"
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Choose Your Move
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {MOVES.map(({ move, emoji, label }) => (
              <button
                type="button"
                key={move}
                onClick={() => setSelectedMove(move)}
                className={`p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  selectedMove === move
                    ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="text-4xl mb-2">{emoji}</div>
                <div className="font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePlayerMove}
            disabled={!selectedMove || isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              selectedMove && !isSubmitting
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Reveal Result"}
          </button>
        </div>
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
