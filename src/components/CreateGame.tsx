import { useNavigate } from "@tanstack/react-router";
import { Group } from "jazz-tools";
import { useAccount } from "jazz-tools/react";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerName } from "@/App";
import { MoveSelector } from "@/components/MoveSelector.tsx";
import { Game, JazzAccount, type Move } from "@/schema.ts";

export function CreateGame() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: { guestGames: true } },
  });
  const editableRef = useRef<HTMLSpanElement>(null);
  const questionInputRef = useRef<HTMLDivElement>(null);

  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const { playerName, setPlayerName } = usePlayerName();

  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  // Restore cursor position after re-renders
  useEffect(() => {
    if (cursorPosition !== null && editableRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();

      // Make sure the content is up to date
      editableRef.current.textContent = playerName;

      // Set cursor position
      const textNode = editableRef.current.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const pos = Math.min(cursorPosition, textNode.textContent?.length || 0);
        range.setStart(textNode, pos);
        range.setEnd(textNode, pos);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [playerName, cursorPosition]);

  const handleCreateGame = useCallback(
    async (move: Move) => {
      if (!me?.root || !me.root.myGames) return;

      try {
        // Create a group for sharing the game
        const gameGroup = Group.create();
        gameGroup.addMember("everyone", "writer"); // Make game writable by everyone so guests can set their move

        // Create new game with proper permissions
        // Using implicit creation - Jazz will create the plays feed with inherited permissions
        const game = Game.create(
          {
            hostMove: move,
            comment: question.trim() || undefined,
            dateCreated: new Date().toISOString(),
            isClosed: false,
            plays: [], // Empty array for plays feed - Jazz handles creation
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
      {!me ? (
        <div className="text-center py-8">
          <p className="mb-4">Please sign in to create a game</p>
        </div>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black lg:max-w-4/5 mb-[.5em] text-center mx-auto">
            Hey{" "}
            <span
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const selection = window.getSelection();
                const value = e.currentTarget.textContent || "";

                // Save cursor position
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const preCaretRange = range.cloneRange();
                  preCaretRange.selectNodeContents(e.currentTarget);
                  preCaretRange.setEnd(range.endContainer, range.endOffset);
                  setCursorPosition(preCaretRange.toString().length);
                }

                setPlayerName(value);
                if (!me?.profile) return;
                me.profile.$jazz.set("name", value);
              }}
              onBlur={() => {
                if (playerName.trim()) return;
                setPlayerName("Anonymous Player");
                if (!me?.profile?.name) return;
                me.profile.$jazz.set("name", "Anonymous Player");
              }}
              className="outline-none min-w-20 text-white inline-block editable"
            >
              {playerName}
            </span>
            , Make your choice!
          </h1>

          <MoveSelector onMoveSelect={handleCreateGame} />

          <div
            ref={questionInputRef}
            className="relative bg-foreground rounded-full py-4 px-5 mb-4 xl:max-w-2/3 mx-auto flex items-center my-12 gap-4"
          >
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => {
                if (questionInputRef.current) {
                  questionInputRef.current.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              placeholder=" "
              maxLength={100}
              className="peer outline-none text-background grow"
            />
            <label
              htmlFor="question"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-all duration-150 ease-out
                peer-focus:-top-5 peer-focus:text-foreground peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-foreground flex items-center gap-1"
            >
              <span>Optional Comment</span>
              <span className="hidden md:inline">
                (e.g., My place or yours?)
              </span>
              {question && (
                <span className="text-foreground/75">
                  {question.length}/100 characters
                </span>
              )}
            </label>
            {question && (
              <button
                type="button"
                className="shrink-0 text-muted hover:text-background transition-all duration-150 ease-out"
                onClick={() => setQuestion("")}
              >
                <XIcon strokeWidth={3} size={24} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
