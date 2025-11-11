import { Link, useNavigate } from "@tanstack/react-router";
import { useAccount } from "jazz-tools/react";
import { ArchiveIcon, BadgeQuestionMarkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { formatGameDate } from "@/helpers";
import { cn } from "@/lib/utils";
import { type GameType, JazzAccount, type Move } from "@/schema";
import { MoveIcon } from "./MoveIcon";
import { Button } from "./ui/button";
import { TabItem } from "./ui/tab-item";

const getGameStatus = (
  game: GameType,
  isGuestGame: boolean,
  hasPlayerMove: boolean,
) => {
  if (!game) return { text: "Unknown", className: "bg-muted" };
  if (game.isClosed)
    return { text: "Closed", className: "bg-orange-800 text-orange-500" };
  if (isGuestGame && !hasPlayerMove)
    return { text: "Open", className: "bg-indigo-900 text-indigo-300" };
  return {
    text: "Active",
    className: "bg-green-800 text-green-500",
  };
};

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
    "my-games",
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

  const handleArchiveGame = (game: GameType) => {
    game.$jazz.set("isClosed", true);
  };

  return (
    <>
      <title>Game Dashboard</title>
      <meta name="description" content="View your game dashboard and history" />
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
                .sort((a: GameType) => {
                  return a.isClosed ? 1 : -1;
                })
                .map((game: GameType) => {
                  const gameId = game.$jazz?.id;

                  if (!gameId) return null;

                  // Get player's move for guest games
                  const myLatestPlay = game.plays?.byMe?.value;
                  const playerMove = myLatestPlay?.playerMove;
                  const hasPlayerMove = !!playerMove;
                  const isGuestGame = activeTab === "guest-games";

                  // Determine which move to display
                  let moveToDisplay: Move | undefined;
                  if (activeTab === "my-games") {
                    moveToDisplay = game.hostMove;
                  } else {
                    moveToDisplay = playerMove;
                  }

                  const status = getGameStatus(
                    game,
                    isGuestGame,
                    hasPlayerMove,
                  );

                  // Get host name for guest games
                  const hostMember = isGuestGame
                    ? game?.$jazz?.owner?.members?.find(
                        (m) => m.role === "admin",
                      )
                    : null;
                  const hostName =
                    hostMember?.account?.profile?.name || "Anonymous Player";

                  return (
                    <div
                      key={gameId}
                      onClick={() => handleGameClick(game)}
                      className="flex items-start gap-4 py-4 lg:py-6 cursor-pointer"
                    >
                      <div
                        className={cn(
                          "shrink-0 p-3 rounded-full aspect-square",
                          moveToDisplay
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {moveToDisplay ? (
                          <MoveIcon className="size-6" move={moveToDisplay} />
                        ) : (
                          <BadgeQuestionMarkIcon size={24} />
                        )}
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
                              {status.text}
                            </span>
                          </div>
                          {game.dateCreated ? (
                            <p className="text-sm text-muted">
                              Created by{" "}
                              <span className="font-bold text-secondary">
                                {isGuestGame ? hostName : "me"}
                              </span>{" "}
                              on {formatGameDate(game.dateCreated)}
                            </p>
                          ) : (
                            <span className="text-sm text-muted">No date</span>
                          )}
                          {game.comment && <p>"{game.comment}"</p>}
                        </div>
                      </div>
                      {activeTab === "my-games" && !game.isClosed && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveGame(game);
                          }}
                        >
                          <ArchiveIcon className="size-4" />
                        </Button>
                      )}
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
      </div>{" "}
    </>
  );
}
