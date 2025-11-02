import { Link, useNavigate } from "@tanstack/react-router";
import { useAccount } from "jazz-tools/react";
import { useState } from "react";
import { formatGameDate } from "@/helpers";
import { cn } from "@/lib/utils";
import { type GameType, JazzAccount, type Move } from "@/schema";
import { MoveIcon } from "./MoveIcon";
import { Button } from "./ui/button";
import { TabItem } from "./ui/tab-item";

export function Dashboard() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: { guestGames: true } },
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my-games" | "guest-games">(
    "my-games",
  );

  // Get games from Jazz - these are real CoLists that will contain game data
  const myGames = me?.root?.myGames || [];
  const guestGames = me?.root?.guestGames || [];
  const currentGames = activeTab === "my-games" ? myGames : guestGames;

  const handleGameClick = (game: GameType) => {
    const gameId = game.$jazz.id;
    navigate({
      to: "/$gameId",
      params: { gameId },
    });
  };

  const handleArchiveGame = (game: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Archive game by updating its isArchived property
    if (game?.$jazz) {
      game.$jazz.set("isArchived", true);
    }
  };

  const getGameStatus = (game: GameType) => {
    if (!game) return { text: "Unknown", className: "bg-muted" };
    if (game.isArchived) return { text: "Archived", className: "bg-slate-300" };
    if (game.winner)
      return { text: "Completed", className: "bg-teal-800 text-teal-500" };
    return {
      text: "Waiting for opponent",
      className: "bg-orange-900 text-orange-500",
    };
  };

  const getWinnerText = (game: GameType) => {
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
      <div className="text-center py-12 space-y-4">
        <div>
          <h3 className="text-4xl font-display font-black text-secondary mb-4">
            Sign In Required
          </h3>
          <p>Please sign in to view your game dashboard and history.</p>
          <p>
            Your games will be saved to your account and accessible across
            devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-display font-black mb-2">
          Game Dashboard
        </h1>
        <p className="text-lg text-muted">
          Welcome back,{" "}
          <span className="font-medium">{me.profile?.name || "Player"}</span>!
        </p>
      </div>

      {/* Tab Navigation */}
      {currentGames.length > 0 && (
        <nav className="flex gap-4">
          <TabItem
            isActive={activeTab === "my-games"}
            onClick={() => setActiveTab("my-games")}
            count={myGames.length}
            className="grow"
          >
            My Games
          </TabItem>
          <TabItem
            isActive={activeTab === "guest-games"}
            onClick={() => setActiveTab("guest-games")}
            count={guestGames.length}
            className="grow"
          >
            Guest Games
          </TabItem>
        </nav>
      )}

      {/* Game List */}
      {currentGames.length === 0 ? (
        <p className="text-lg font-medium text-center">
          {activeTab === "my-games"
            ? "Create your first game and challenge someone!"
            : "No games played as a guest yet."}
        </p>
      ) : (
        <div className="divide-y-2 divide-accent">
          {Array.isArray(currentGames) && currentGames.length > 0 ? (
            currentGames
              .filter((game: GameType) => game != null)
              .map((game: GameType, index: number) => {
                const status = getGameStatus(game);
                const gameId = game.$jazz?.id;

                if (!gameId) return null;

                return (
                  <div
                    key={gameId || index}
                    onClick={() => handleGameClick(game)}
                    className="flex items-start gap-4 py-4 lg:py-6 cursor-pointer"
                  >
                    <div className="shrink-0 p-3 bg-secondary rounded-full aspect-square text-secondary-foreground">
                      <MoveIcon
                        className="size-6"
                        move={
                          activeTab === "my-games"
                            ? game.hostMove
                            : (game.playerMove as Move)
                        }
                      />
                    </div>
                    <div className="grow flex flex-col md:flex-row gap-3">
                      <div className="grow space-y-2">
                        <div>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              status.className,
                            )}
                          >
                            {status.text}{" "}
                            {game.dateCompleted &&
                              `- ${formatGameDate(game.dateCompleted)}`}
                          </span>
                        </div>
                        {game.dateCreated ? (
                          <p className="text-sm text-muted">
                            {formatGameDate(game.dateCreated)}
                          </p>
                        ) : (
                          <p className="text-sm text-muted">No date</p>
                        )}
                        {game.comment && <p>"{game.comment}"</p>}
                      </div>
                      <div className="space-y-2 flex flex-col md:items-end">
                        {game.winner && (
                          <p
                            className={cn(
                              "font-semibold",
                              game.winner === "DRAW"
                                ? "text-muted"
                                : game.winner === "HOST"
                                ? "text-teal-500"
                                : "text-destructive",
                            )}
                          >
                            {getWinnerText(game)}
                          </p>
                        )}
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
      <div className="flex gap-4 justify-center">
        <Button type="button" asChild>
          <Link to="/">Create New Game</Link>
        </Button>
      </div>
    </div>
  );
}
