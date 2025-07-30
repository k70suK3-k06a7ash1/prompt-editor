export interface PromptVersion {
	id: number;
	title: string;
	original_prompt: string;
	variable_values: Record<string, string>;
	created_at: string;
	updated_at: string;
}