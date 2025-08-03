import type { PromptVersion } from "@/types";

export class PromptRepository {
	constructor(
		private db: ReturnType<
			typeof import("@electric-sql/pglite-react").usePGlite
		>,
	) {}

	async savePrompt(
		title: string,
		originalPrompt: string,
		variableValues: Record<string, string>,
	): Promise<number> {
		const result = await this.db.query(
			"INSERT INTO prompt_versions (title, original_prompt, variable_values) VALUES ($1, $2, $3) RETURNING id",
			[title, originalPrompt, JSON.stringify(variableValues)],
		);
		return (result.rows[0] as any).id;
	}

	async updatePrompt(
		id: number,
		title: string,
		originalPrompt: string,
		variableValues: Record<string, string>,
	): Promise<void> {
		await this.db.query(
			"UPDATE prompt_versions SET title = $1, original_prompt = $2, variable_values = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
			[title, originalPrompt, JSON.stringify(variableValues), id],
		);
	}

	async deletePrompt(id: number): Promise<void> {
		await this.db.query("DELETE FROM prompt_versions WHERE id = $1", [id]);
	}

	async deleteAutoSaves(): Promise<void> {
		await this.db.query(
			"DELETE FROM prompt_versions WHERE title LIKE '[Auto-save]%'",
		);
	}

	async deleteAllSavedPrompts(): Promise<void> {
		await this.db.query(
			"DELETE FROM prompt_versions WHERE title NOT LIKE '[Auto-save]%'",
		);
	}

	async getAllPrompts(): Promise<PromptVersion[]> {
		const result = await this.db.query<PromptVersion>(
			"SELECT * FROM prompt_versions ORDER BY created_at DESC",
		);
		return result.rows;
	}
}
