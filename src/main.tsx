import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import LoadingState from "./components/LoadingState.tsx";

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { PGliteProvider } from "@electric-sql/pglite-react"

async function initializeApp() {
	// biome-ignore lint/style/noNonNullAssertion: root element exists
	const root = createRoot(document.getElementById("root")!);
	
	// Show loading state
	root.render(
		<StrictMode>
			<LoadingState />
		</StrictMode>
	);

	try {
		const db = await PGlite.create({
			extensions: { live }
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
			</StrictMode>
		);
	} catch (error) {
		console.error("Failed to initialize database:", error);
		root.render(
			<StrictMode>
				<div className="min-h-screen flex items-center justify-center bg-white">
					<div className="text-center">
						<p className="text-red-600 mb-2">Database initialization failed</p>
						<p className="text-gray-600 text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
					</div>
				</div>
			</StrictMode>
		);
	}
}

initializeApp();
