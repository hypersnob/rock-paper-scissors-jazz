import { Link, Outlet } from "@tanstack/react-router";
import { useAccount } from "jazz-tools/react";
import { InfoIcon, ListIcon } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Logo from "@/icons/Logo.svg?react";
import { JazzAccount } from "@/schema";

type PlayerNameContextType = {
  playerName: string;
  setPlayerName: (name: string) => void;
};

const PlayerNameContext = createContext<PlayerNameContextType | undefined>(
  undefined
);

export function usePlayerName() {
  const context = useContext(PlayerNameContext);
  if (context === undefined) {
    throw new Error("usePlayerName must be used within a PlayerNameProvider");
  }
  return context;
}

function App() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true },
  });
  const [playerName, setPlayerName] = useState(
    me?.profile?.name || "Anonymous Player"
  );

  // Sync local state with profile when profile loads or changes
  useEffect(() => {
    if (me?.profile?.name) {
      setPlayerName(me.profile.name);
    }
  }, [me?.profile?.name]);

  return (
    <PlayerNameContext.Provider value={{ playerName, setPlayerName }}>
      <header className="py-6 container mx-auto">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-bold text-lg">
              <Logo className="size-9 text-primary hover:text-white transition-colors duration-300" />
            </Link>
          </div>

          <AuthButton playerName={playerName} />
        </nav>
      </header>
      <main className="flex flex-col justify-center grow container mx-auto xl:max-w-5xl">
        <Outlet />
      </main>
      <footer className="flex justify-between items-center py-6 container mx-auto">
        <Button variant="ghost" asChild>
          <Link to="/dashboard">
            <ListIcon strokeWidth={3} size={28} />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/about">
            <InfoIcon strokeWidth={3} size={28} />
          </Link>
        </Button>
      </footer>
    </PlayerNameContext.Provider>
  );
}

export default App;
