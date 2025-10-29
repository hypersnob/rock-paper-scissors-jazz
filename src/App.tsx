import { Link, Outlet } from "@tanstack/react-router";
import { useAccount, useIsAuthenticated } from "jazz-tools/react";
import { AuthButton } from "@/components/AuthButton";
import Logo from "@/icons/Logo.svg?react";
import { JazzAccount } from "@/schema";

function App() {
  const { me } = useAccount(JazzAccount, {
    resolve: { profile: true, root: true },
  });

  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <header>
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-bold text-lg">
              <Logo className="w-10 h-10 text-primary" />
            </Link>
            {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <span className="text-sm">
                Welcome, {me?.profile?.name || "Player"}!
              </span>
            ) : (
              <span className="text-sm">Sign in to save your games</span>
            )}
            <AuthButton />
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
