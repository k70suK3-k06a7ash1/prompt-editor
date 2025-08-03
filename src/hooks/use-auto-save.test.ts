import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoSave } from "./use-auto-save";

// Mock PromptRepository
const mockPromptRepository = {
	savePrompt: vi.fn(),
	updatePrompt: vi.fn(),
	deletePrompt: vi.fn(),
	deleteAutoSaves: vi.fn(),
};

describe("useAutoSave", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should not auto-save empty or short content", () => {
		renderHook(() =>
			useAutoSave({
				originalPrompt: "short",
				variableValues: {},
				promptRepository: mockPromptRepository as any,
				debounceMs: 500,
				minContentLength: 10,
			}),
		);

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(mockPromptRepository.savePrompt).not.toHaveBeenCalled();
	});

	it("should auto-save after debounce period", async () => {
		mockPromptRepository.savePrompt.mockResolvedValue(123);

		const { result } = renderHook(() =>
			useAutoSave({
				originalPrompt: "This is a long enough prompt for auto-save",
				variableValues: { name: "John" },
				promptRepository: mockPromptRepository as any,
				debounceMs: 500,
				minContentLength: 10,
			}),
		);

		expect(result.current.saveStatus).toBe("idle");

		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Wait for async operation
		await act(async () => {
			await vi.runAllTimersAsync();
		});

		expect(mockPromptRepository.savePrompt).toHaveBeenCalledWith(
			expect.stringContaining("[Auto-save]"),
			"This is a long enough prompt for auto-save",
			{ name: "John" },
		);
	});

	it("should update existing auto-save instead of creating new one", async () => {
		mockPromptRepository.savePrompt.mockResolvedValue(123);
		mockPromptRepository.updatePrompt.mockResolvedValue(undefined);

		const { rerender } = renderHook(
			({ originalPrompt }) =>
				useAutoSave({
					originalPrompt,
					variableValues: {},
					promptRepository: mockPromptRepository as any,
					debounceMs: 500,
					minContentLength: 10,
				}),
			{
				initialProps: { originalPrompt: "First auto-save content" },
			},
		);

		// First auto-save
		act(() => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			await vi.runAllTimersAsync();
		});

		expect(mockPromptRepository.savePrompt).toHaveBeenCalledTimes(1);

		// Update content
		rerender({ originalPrompt: "Updated auto-save content" });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			await vi.runAllTimersAsync();
		});

		expect(mockPromptRepository.updatePrompt).toHaveBeenCalledWith(
			123,
			expect.stringContaining("[Auto-save]"),
			"Updated auto-save content",
			{},
		);
	});

	it("should handle save errors gracefully", async () => {
		mockPromptRepository.savePrompt.mockRejectedValue(new Error("Save failed"));
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		renderHook(() =>
			useAutoSave({
				originalPrompt: "This is a long enough prompt for auto-save",
				variableValues: {},
				promptRepository: mockPromptRepository as any,
				debounceMs: 500,
			}),
		);

		act(() => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			await vi.runAllTimersAsync();
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Auto-save failed:",
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});

	it("should identify auto-save prompts correctly", () => {
		const { result } = renderHook(() =>
			useAutoSave({
				originalPrompt: "test",
				variableValues: {},
				promptRepository: mockPromptRepository as any,
			}),
		);

		act(() => {
			expect(result.current.isAutoSave("[Auto-save] 2023-01-01 12:00:00")).toBe(
				true,
			);
			expect(result.current.isAutoSave("Regular prompt title")).toBe(false);
		});
	});

	it("should clear auto-save when requested", async () => {
		mockPromptRepository.savePrompt.mockResolvedValue(123);
		mockPromptRepository.deletePrompt.mockResolvedValue(undefined);

		const { result } = renderHook(() =>
			useAutoSave({
				originalPrompt: "This is a long enough prompt for auto-save",
				variableValues: {},
				promptRepository: mockPromptRepository as any,
				debounceMs: 500,
			}),
		);

		// Create auto-save
		act(() => {
			vi.advanceTimersByTime(500);
		});

		await act(async () => {
			await vi.runAllTimersAsync();
		});

		// Clear auto-save
		await act(async () => {
			await result.current.clearAutoSave();
		});

		expect(mockPromptRepository.deletePrompt).toHaveBeenCalledWith(123);
	});

	it("should purge all auto-saves when requested", async () => {
		mockPromptRepository.deleteAutoSaves.mockResolvedValue(undefined);

		const { result } = renderHook(() =>
			useAutoSave({
				originalPrompt: "test",
				variableValues: {},
				promptRepository: mockPromptRepository as any,
			}),
		);

		await act(async () => {
			await result.current.purgeAllAutoSaves();
		});

		expect(mockPromptRepository.deleteAutoSaves).toHaveBeenCalledTimes(1);
	});
});
