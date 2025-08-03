import type { PromptVersion } from "@/types";

export class PromptRepository {
	constructor(private db: ReturnType<typeof import("@electric-sql/pglite-react").usePGlite>) {}

	async savePrompt(
		title: string,
		originalPrompt: string,
		variableValues: Record<string, string>,
	): Promise<void> {
		await this.db.query(
			"INSERT INTO prompt_versions (title, original_prompt, variable_values) VALUES ($1, $2, $3)",
			[title, originalPrompt, JSON.stringify(variableValues)],
		);
	}

	async deletePrompt(id: number): Promise<void> {
		await this.db.query("DELETE FROM prompt_versions WHERE id = $1", [id]);
	}

	async getAllPrompts(): Promise<PromptVersion[]> {
		const result = await this.db.query<PromptVersion>(
			"SELECT * FROM prompt_versions ORDER BY created_at DESC",
		);
		return result.rows;
	}
}