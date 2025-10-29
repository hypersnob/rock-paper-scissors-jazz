import { cn } from "@/lib/utils.ts";
import type { Move } from "../schema.ts";
import { MoveIcon } from "./MoveIcon.tsx";

const MOVES: { move: Move; label: string }[] = [
  { move: "ROCK", label: "Rock" },
  { move: "PAPER", label: "Paper" },
  { move: "SCISSORS", label: "Scissors" },
];

type MoveSelectorProps = {
  onMoveSelect: (move: Move) => Promise<void>;
};

export function MoveSelector({ onMoveSelect }: MoveSelectorProps) {
  return (
    <>
      {/* SVG filter for goo effect - must be defined first */}
      <svg
        style={{ visibility: "hidden", position: "absolute" }}
        width="0"
        height="0"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <title>Goo effect</title>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-wrap md:flex-nowrap place-items-center">
        {MOVES.map(({ move, label }, index) => (
          <div
            key={move}
            className={cn(
              "relative text-primary-foreground transition-all transform group flex flex-col items-center justify-center p-4 aspect-[cos(30deg)] basis-1/2 md:basis-1/3",
              index === MOVES.length - 1 &&
                "mx-auto md:mx-0 -mt-[12.5%] md:mt-0"
            )}
            style={
              {
                filter: "url('#goo')",
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              title={label}
              onClick={() => onMoveSelect(move)}
              className="flex items-center justify-center aspect-square"
            >
              <MoveIcon
                move={move}
                className="group-hover:scale-105 transition-all transform size-2/3 lg:size-1/2 relative z-10"
              />
            </button>
            <div
              className="absolute inset-4 bg-secondary group-hover:bg-primary transition-all transform pointer-events-none"
              style={{
                clipPath:
                  "polygon(0% 25%,0% 75%,50% 100%,100% 75%,100% 25%,50% 0%)",
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
