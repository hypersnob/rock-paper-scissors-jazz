import { useNavigate } from "@tanstack/react-router";
import { useAccount } from "jazz-tools/react";
import { useState } from "react";
import { JazzAccount } from "@/schema";
import { formatGameDate } from "@/helpers";

export function Dashboard() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my-games" | "guest-games">(
    "my-games",
  );

  // Get games from Jazz - these are real CoLists that will contain game data
  const myGames = me?.root?.myGames || [];
  const guestGames = me?.root?.guestGames || [];
  const currentGames = activeTab === "my-games" ? myGames : guestGames;

  const handleGameClick = (game: any) => {
    const gameId = game.$jazz.id;
    navigate({
      to: "/$gameId",
      params: { gameId },
    });
  };

  // const handleArchiveGame = (game: any, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   // Archive game by updating its isArchived property
  //   if (game?.$jazz) {
  //     game.$jazz.set("isArchived", true);
  //   }
  // };

  const getGameStatus = (game: any) => {
    if (!game)
      return { text: "Unknown", className: "bg-gray-100 text-gray-600" };
    if (game.isArchived)
      return { text: "Archived", className: "bg-gray-100 text-gray-600" };
    if (game.winner)
      return { text: "Completed", className: "bg-green-100 text-green-700" };
    return {
      text: "Waiting for opponent",
      className: "bg-yellow-100 text-yellow-700",
    };
  };

  const getWinnerText = (game: any) => {
    if (!game.winner) return "";
    const isMyGame = activeTab === "my-games";
    const userWon =
      (isMyGame && game.winner === "HOST") ||
      (!isMyGame && game.winner === "PLAYER");
    const isDraw = game.winner === "DRAW";

    if (isDraw) return "🤝 Draw";
    return userWon ? "🎉 You Won!" : "😔 You Lost";
  };

  if (!me) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Sign In Required
          </h3>
          <p className="text-blue-600 mb-6">
            Please sign in to view your game dashboard and history.
          </p>
          <p className="text-sm text-blue-500">
            Your games will be saved to your account and accessible across
            devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Game Dashboard</h1>
        <p className="text-gray-600">
          Welcome back,{" "}
          <span className="font-medium">{me.profile?.name || "Player"}</span>!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("my-games")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "my-games"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Games ({myGames.length})
          </button>
          <button
            onClick={() => setActiveTab("guest-games")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "guest-games"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Guest Games ({guestGames.length})
          </button>
        </nav>
      </div>

      {/* Game List */}
      {currentGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No games yet
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "my-games"
                ? "Create your first game and challenge someone!"
                : "No games played as a guest yet."}
            </p>
            {activeTab === "my-games" && (
              <button
                onClick={() => navigate({ to: "/" })}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create New Game
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(currentGames) && currentGames.length > 0 ? (
            currentGames
              .filter((game: any) => game != null)
              .map((game: any, index: number) => {
                const status = getGameStatus(game);
                const gameId = game.$jazz?.id;

                if (!gameId) return null;

                return (
                  <div
                    key={gameId || index}
                    onClick={() => handleGameClick(game)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                          >
                            {status.text}
                          </span>
                          <span className="text-sm text-gray-500">
                            {game.dateCreated
                              ? formatGameDate(game.dateCreated)
                              : "No date"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {game.hostMove && `Your move: ${game.hostMove}`}
                            </p>
                            {game.question && (
                              <p className="text-sm text-gray-600 italic mt-1">
                                "{game.question}"
                              </p>
                            )}
                            {game.dateCompleted && (
                              <p className="text-xs text-gray-500 mt-1">
                                Completed {formatGameDate(game.dateCompleted)}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            {game.winner && (
                              <p
                                className={`font-semibold ${
                                  game.winner === "DRAW"
                                    ? "text-gray-600"
                                    : (activeTab === "my-games" &&
                                        game.winner === "HOST") ||
                                      (activeTab === "guest-games" &&
                                        game.winner === "PLAYER")
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {getWinnerText(game)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No games found</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-4">
          <button
            onClick={() => navigate({ to: "/" })}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Create New Game
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
