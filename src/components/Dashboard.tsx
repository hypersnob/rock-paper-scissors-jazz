import { Link, useNavigate } from "@tanstack/react-router";
import { useAccount } from "jazz-tools/react";
import { useEffect, useState } from "react";
import { formatGameDate } from "@/helpers";
import { cn } from "@/lib/utils";
import { type GameType, JazzAccount } from "@/schema";
import { MoveIcon } from "./MoveIcon";
import { Button } from "./ui/button";
import { TabItem } from "./ui/tab-item";

export function Dashboard() {
  const { me } = useAccount(JazzAccount, {
    resolve: {
      profile: true,
      root: {
        guestGames: { $each: { plays: true } },
        myGames: { $each: { plays: true } },
      },
    },
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my-games" | "guest-games">(
    "my-games"
  );

  // Get games from Jazz - these are real CoLists that will contain game data
  const myGames = me?.root?.myGames || [];
  const guestGames = me?.root?.guestGames || [];

  // Auto-switch to guest-games tab if user has no games but has guest games
  useEffect(() => {
    if (myGames.length === 0 && guestGames.length > 0) {
      setActiveTab("guest-games");
    }
  }, [myGames.length, guestGames.length]);

  const currentGames = activeTab === "my-games" ? myGames : guestGames;

  const handleGameClick = (game: GameType) => {
    const gameId = game.$jazz.id;
    navigate({
      to: "/$gameId",
      params: { gameId },
    });
  };

  const getGameStatus = (game: GameType) => {
    if (!game) return { text: "Unknown", className: "bg-muted" };
    if (game.isArchived) return { text: "Archived", className: "bg-slate-300" };
    return {
      text: "Active",
      className: "bg-green-800 text-green-500",
    };
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
      {(myGames.length > 0 || guestGames.length > 0) && (
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
              .map((game: GameType) => {
                const status = getGameStatus(game);
                const gameId = game.$jazz?.id;

                if (!gameId) return null;

                // Get player's move for guest games
                const myLatestPlay = game.plays?.byMe?.value;
                const playerMove = myLatestPlay?.playerMove;

                return (
                  <div
                    key={gameId}
                    onClick={() => handleGameClick(game)}
                    className="flex items-start gap-4 py-4 lg:py-6 cursor-pointer"
                  >
                    <div className="shrink-0 p-3 bg-secondary rounded-full aspect-square text-secondary-foreground">
                      {activeTab === "my-games" ? (
                        <MoveIcon className="size-6" move={game.hostMove} />
                      ) : playerMove ? (
                        <MoveIcon className="size-6" move={playerMove} />
                      ) : (
                        <div className="size-6" />
                      )}
                    </div>
                    <div className="grow flex flex-col md:flex-row gap-3">
                      <div className="grow space-y-2">
                        <div>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              status.className
                            )}
                          >
                            {status.text}
                          </span>
                        </div>
                        {game.dateCreated ? (
                          <p className="text-sm text-muted">
                            Created: {formatGameDate(game.dateCreated)}
                          </p>
                        ) : (
                          <p className="text-sm text-muted">No date</p>
                        )}
                        {game.comment && <p>"{game.comment}"</p>}
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
