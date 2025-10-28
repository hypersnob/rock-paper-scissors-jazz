import { useNavigate } from "@tanstack/react-router";
import { Group } from "jazz-tools";
import { useAccount } from "jazz-tools/react";
import { useEffect, useState } from "react";
import { Game, JazzAccount, type Move } from "../schema.ts";

const MOVES: { move: Move; emoji: string; label: string }[] = [
  { move: "ROCK", emoji: "🪨", label: "Rock" },
  { move: "PAPER", emoji: "📄", label: "Paper" },
  { move: "SCISSORS", emoji: "✂️", label: "Scissors" },
];

export function CreateGame() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });

  const navigate = useNavigate();
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [question, setQuestion] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [playerName, setPlayerName] = useState(me?.profile?.name || "");

  // Sync local state with profile when profile loads or changes
  useEffect(() => {
    if (me?.profile?.name) {
      setPlayerName(me.profile.name);
    }
  }, [me?.profile?.name]);

  const handleCreateGame = async () => {
    if (!selectedMove || !me?.root || !me.root.myGames) return;

    setIsCreating(true);

    try {
      // Create a group for sharing the game
      const gameGroup = Group.create();
      gameGroup.addMember("everyone", "writer"); // Make game writable by everyone so guests can set their move

      // Create new game with proper permissions
      const game = Game.create(
        {
          hostMove: selectedMove,
          playerMove: undefined,
          winner: undefined,
          question: question.trim() || undefined,
          dateCreated: new Date().toISOString(),
          dateCompleted: undefined,
          isArchived: false,
        },
        gameGroup
      );

      // Add game to user's games using the $jazz.push method
      // TypeScript thinks this could be null but migration ensures it exists
      me.root.myGames.$jazz.push(game);

      // Navigate to game page using the game's Jazz ID
      navigate({
        to: "/$gameId",
        params: { gameId: game.$jazz.id },
      });
    } catch (error) {
      // biome-ignore lint: for debugging
      console.error("Failed to create game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Create New Game</h2>

      {!me ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please sign in to create a game</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => {
                const value = e.target.value;
                setPlayerName(value);
                if (me?.profile) {
                  me.profile.$jazz.set("name", value);
                }
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
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

          <div className="mb-8">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Optional Question (e.g., "My place or yours?")
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Add a question for the loser to answer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {question.length}/100 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCreateGame}
              disabled={!selectedMove || isCreating}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                selectedMove && !isCreating
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isCreating ? "Creating Game..." : "Create Game"}
            </button>
          </div>

          {selectedMove && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                You selected <strong>{selectedMove}</strong>. Your opponent
                won't see your choice until they make their move!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
