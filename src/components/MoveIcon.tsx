import PaperIcon from "@/icons/Paper.svg?react";
import RockIcon from "@/icons/Rock.svg?react";
import ScissorsIcon from "@/icons/Scissors.svg?react";
import type { Move } from "@/schema.ts";

type MoveIconProps = {
  move: Move;
  className?: string;
};

const MOVE_ICONS = {
  ROCK: RockIcon,
  PAPER: PaperIcon,
  SCISSORS: ScissorsIcon,
} as const;

export function MoveIcon({ move, className }: MoveIconProps) {
  const Icon = MOVE_ICONS[move];
  return <Icon className={className} />;
}
