import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function About() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-black mb-4">
          About Rock Paper Scissors
        </h1>
        <p className="text-lg text-muted">
          An interactive social game built with Jazz.tools
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-display font-bold mb-3">How It Works</h2>
          <div className="space-y-4">
            <p>
              Rock Paper Scissors is a classic game where two players make
              simultaneous moves. Rock beats Scissors, Scissors beats Paper, and
              Paper beats Rock.
            </p>
            <p>
              In this social version, you can create games, invite friends, and
              track your game history.
            </p>
            <p>
              Each game can include an optional question that the result will
              answer, making it perfect for decision-making!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-3">
            Game Features
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Create games and share links with friends</li>
            <li>Add optional questions to make decisions fun</li>
            <li>Track your game history in your dashboard</li>
            <li>Play as a guest or create a permanent account</li>
            <li>View games you've hosted and games you've played as a guest</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-3">
            Getting Started
          </h2>
          <div className="space-y-4">
            <p>
              To start playing, simply create a new game, make your move, and
              share the link with a friend. They'll be able to make their move
              and see the result!
            </p>
            <p>
              You can also sign in to create a permanent account and access your
              game dashboard to view all your games in one place.
            </p>
          </div>
        </section>
        <p>
          Fun project by{" "}
          <a
            href="https://promptpong.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Prompt Pong
          </a>
        </p>
      </div>

      <div className="flex gap-4 justify-center pt-4">
        <Button type="button" asChild>
          <Link to="/">Create New Game</Link>
        </Button>
        <Button type="button" variant="secondary" asChild>
          <Link to="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
