import { Link, Outlet } from "@tanstack/react-router";
import { AuthButton } from "@/components/AuthButton";
import Logo from "@/icons/Logo.svg?react";

function App() {
  return (
    <>
      <header className="py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-bold text-lg">
              <Logo className="w-10 h-10 text-primary hover:text-white transition-colors duration-300" />
            </Link>
          </div>

          <AuthButton />
        </nav>
      </header>
      <main className="flex flex-col justify-center grow">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-muted-foreground py-6">
        <p>
          &copy; {new Date().getFullYear()} Hard Rock Paper Scissors. All rights
          reserved.
        </p>
      </footer>
    </>
  );
}

export default App;
