import { useNavigate } from "@tanstack/react-router";
import { Group } from "jazz-tools";
import { useAccount } from "jazz-tools/react";
import { useCallback, useEffect, useState } from "react";
import { Game, JazzAccount, type Move } from "../schema.ts";
import { MoveSelector } from "./MoveSelector.tsx";

export function CreateGame() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });

  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [playerName, setPlayerName] = useState(me?.profile?.name || "");

  // Sync local state with profile when profile loads or changes
  useEffect(() => {
    if (me?.profile?.name) {
      setPlayerName(me.profile.name);
    }
  }, [me?.profile?.name]);

  const handleCreateGame = useCallback(
    async (move: Move) => {
      if (!me?.root || !me.root.myGames) return;

      try {
        // Create a group for sharing the game
        const gameGroup = Group.create();
        gameGroup.addMember("everyone", "writer"); // Make game writable by everyone so guests can set their move

        // Create new game with proper permissions
        const game = Game.create(
          {
            hostMove: move,
            playerMove: undefined,
            winner: undefined,
            comment: question.trim() || undefined,
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
      }
    },
    [me, question, navigate]
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-8">Create New Game</h2>

      {!me ? (
        <div className="text-center py-8">
          <p className="mb-4">Please sign in to create a game</p>
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

          <MoveSelector onMoveSelect={handleCreateGame} />

          <div className="mb-8">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Optional Comment (e.g., "My place or yours?")
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
        </>
      )}
    </div>
  );
}
