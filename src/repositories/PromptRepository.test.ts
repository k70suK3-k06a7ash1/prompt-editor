import { describe, it, expect, vi, beforeEach } from "vitest";
import { PromptRepository } from "./PromptRepository";

describe("PromptRepository", () => {
	let mockDb: any;
	let promptRepository: PromptRepository;

	beforeEach(() => {
		mockDb = {
			query: vi.fn(),
		};
		promptRepository = new PromptRepository(mockDb);
	});

	describe("deleteAllSavedPrompts", () => {
		it("should delete all saved prompts but not auto-saves", async () => {
			mockDb.query.mockResolvedValue({ rows: [] });

			await promptRepository.deleteAllSavedPrompts();

			expect(mockDb.query).toHaveBeenCalledWith(
				"DELETE FROM prompt_versions WHERE title NOT LIKE '[Auto-save]%'",
			);
		});
	});

	describe("deleteAutoSaves", () => {
		it("should delete all auto-saves but not saved prompts", async () => {
			mockDb.query.mockResolvedValue({ rows: [] });

			await promptRepository.deleteAutoSaves();

			expect(mockDb.query).toHaveBeenCalledWith(
				"DELETE FROM prompt_versions WHERE title LIKE '[Auto-save]%'",
			);
		});
	});

	describe("savePrompt", () => {
		it("should save a prompt and return the ID", async () => {
			const mockId = 123;
			mockDb.query.mockResolvedValue({ rows: [{ id: mockId }] });

			const result = await promptRepository.savePrompt(
				"Test Title",
				"Test Prompt",
				{ var1: "value1" },
			);

			expect(result).toBe(mockId);
			expect(mockDb.query).toHaveBeenCalledWith(
				"INSERT INTO prompt_versions (title, original_prompt, variable_values) VALUES ($1, $2, $3) RETURNING id",
				["Test Title", "Test Prompt", '{"var1":"value1"}'],
			);
		});
	});
});