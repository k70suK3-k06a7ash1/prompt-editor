import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { PGliteProvider } from "@electric-sql/pglite-react"

const db = await PGlite.create({
  extensions: { live }
})

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

// biome-ignore lint/style/noNonNullAssertion: root element exists
createRoot(document.getElementById("root")!).render(
	<StrictMode>
        <PGliteProvider db={db}>
          <App />
        </PGliteProvider>
		<Toaster />
	</StrictMode>,
);
