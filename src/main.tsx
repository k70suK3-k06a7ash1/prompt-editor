import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";

import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import App from "./App.tsx";
import LoadingState from "./components/LoadingState.tsx";

async function initializeApp() {
	// biome-ignore lint/style/noNonNullAssertion: root element exists
	const root = createRoot(document.getElementById("root")!);

	// Show loading state
	root.render(
		<StrictMode>
			<LoadingState />
		</StrictMode>,
	);

	try {
		const db = await PGlite.create({
			extensions: { live },
		});

		// Initialize database schema
		await db.exec(`
			CREATE TABLE IF NOT EXISTS prompt_versions (
				id SERIAL PRIMARY KEY,
				title VARCHAR(255) NOT NULL,
				original_prompt TEXT NOT NULL,
				variable_values JSONB NOT NULL DEFAULT '{}',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_at 
			ON prompt_versions(created_at DESC);
		`);

		// Render the actual app after database is ready
		root.render(
			<StrictMode>
				<PGliteProvider db={db}>
					<App />
				</PGliteProvider>
				<Toaster />
			</StrictMode>,
		);
	} catch (error) {
		console.error("Failed to initialize database:", error);
		root.render(
			<StrictMode>
				<div className="min-h-screen min-w-screen bg-gray-50 py-8 px-4 font-inter flex items-center justify-center">
					<div className="max-w-md mx-auto">
						<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
							<div className="mx-auto h-10 w-10 md:h-12 md:w-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
								<svg
									className="h-6 w-6 md:h-8 md:w-8 text-red-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-label="Error icon"
								>
									<title>Error icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<h2 className="text-lg md:text-xl font-semibold text-red-600 mb-2">
								Database initialization failed
							</h2>
							<p className="text-sm md:text-base text-gray-600 leading-relaxed">
								{error instanceof Error
									? error.message
									: "Unknown error occurred"}
							</p>
						</div>
					</div>
				</div>
			</StrictMode>,
		);
	}
}

initializeApp();
