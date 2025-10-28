import { Link, Outlet } from "@tanstack/react-router";
import { useAccount, useIsAuthenticated } from "jazz-tools/react";
import { AuthButton } from "./AuthButton.tsx";
import { JazzAccount } from "./schema.ts";

function App() {
	const { me } = useAccount(JazzAccount, {
		resolve: { profile: true, root: true },
	});

	const isAuthenticated = useIsAuthenticated();

	return (
		<>
			<header>
				<nav className="max-w-2xl mx-auto flex justify-between items-center p-3">
					<div className="flex items-center gap-4">
						<Link to="/" className="font-bold text-lg">
							<span className="text-blue-600">Hard</span> Rock Paper Scissors
						</Link>
						{isAuthenticated && (
							<Link
								to="/dashboard"
								className="text-gray-600 hover:text-gray-900"
							>
								Dashboard
							</Link>
						)}
					</div>
					<div className="flex items-center gap-3">
						{isAuthenticated ? (
							<span className="text-sm text-gray-600">
								Welcome, {me?.profile?.name || "Player"}!
							</span>
						) : (
							<span className="text-sm text-gray-600">
								Sign in to save your games
							</span>
						)}
						<AuthButton />
					</div>
				</nav>
			</header>
			<main className="max-w-2xl mx-auto px-3 mt-8">
				<Outlet />
			</main>
		</>
	);
}

export default App;
