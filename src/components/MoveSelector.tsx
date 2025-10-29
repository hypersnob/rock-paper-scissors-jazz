import PaperIcon from "@/icons/Paper.svg?react";
import RockIcon from "@/icons/Rock.svg?react";
import ScissorsIcon from "@/icons/Scissors.svg?react";
import type { Move } from "../schema.ts";

const MOVES: { move: Move; icon: typeof PaperIcon; label: string }[] = [
  { move: "ROCK", icon: RockIcon, label: "Rock" },
  { move: "PAPER", icon: PaperIcon, label: "Paper" },
  { move: "SCISSORS", icon: ScissorsIcon, label: "Scissors" },
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 lg:gap-x-8 place-items-center">
        {MOVES.map(({ move, icon: Icon, label }, index) => (
          <button
            type="button"
            title={label}
            key={move}
            onClick={() => onMoveSelect(move)}
            className={`relative text-primary-foreground group flex flex-col items-center justify-center p-6 aspect-[cos(30deg)] ${
              index === MOVES.length - 1
                ? "col-span-2 lg:col-span-1 max-w-1/2 lg:max-w-none mx-auto lg:mx-0"
                : ""
            }`}
            style={
              {
                filter: "url('#goo')",
              } as React.CSSProperties
            }
          >
            <div
              className="absolute inset-0 bg-secondary aspect-[cos(30deg)] pointer-events-none"
              style={{
                clipPath:
                  "polygon(0% 25%,0% 75%,50% 100%,100% 75%,100% 25%,50% 0%)",
              }}
            />

            <Icon className="mb-2 group-hover:scale-105 transition-all transform size-2/3 relative z-10" />
          </button>
        ))}
      </div>
    </>
  );
}
