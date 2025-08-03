import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionPersistence } from "./use-session-persistence";

// Mock sessionStorage
const mockSessionStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
	value: mockSessionStorage,
});

describe("useSessionPersistence", () => {
	const mockSetters = {
		setOriginalPrompt: vi.fn(),
		setVariableValues: vi.fn(),
		setPromptTitle: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should load saved session data on mount", () => {
		const savedData = {
			originalPrompt: "Test prompt",
			variableValues: { name: "John" },
			promptTitle: "Test title",
			lastModified: Date.now(),
		};

		mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedData));

		renderHook(() =>
			useSessionPersistence({
				originalPrompt: "",
				variableValues: {},
				promptTitle: "",
				...mockSetters,
			}),
		);

		expect(mockSetters.setOriginalPrompt).toHaveBeenCalledWith("Test prompt");
		expect(mockSetters.setVariableValues).toHaveBeenCalledWith({
			name: "John",
		});
		expect(mockSetters.setPromptTitle).toHaveBeenCalledWith("Test title");
	});

	it("should not load expired session data", () => {
		const expiredData = {
			originalPrompt: "Test prompt",
			variableValues: { name: "John" },
			promptTitle: "Test title",
			lastModified: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
		};

		mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

		renderHook(() =>
			useSessionPersistence({
				originalPrompt: "",
				variableValues: {},
				promptTitle: "",
				...mockSetters,
			}),
		);

		expect(mockSetters.setOriginalPrompt).not.toHaveBeenCalled();
		expect(mockSetters.setVariableValues).not.toHaveBeenCalled();
		expect(mockSetters.setPromptTitle).not.toHaveBeenCalled();
	});

	it("should save session data with debouncing", () => {
		const { rerender } = renderHook(
			({ originalPrompt }) =>
				useSessionPersistence({
					originalPrompt,
					variableValues: {},
					promptTitle: "",
					...mockSetters,
					debounceMs: 500,
				}),
			{
				initialProps: { originalPrompt: "" },
			},
		);

		// Update the prompt
		rerender({ originalPrompt: "New prompt" });

		// Should not save immediately
		expect(mockSessionStorage.setItem).not.toHaveBeenCalled();

		// Fast-forward time
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should save after debounce
		expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
			"prompt-editor-session",
			expect.stringContaining("New prompt"),
		);
	});

	it("should clear session data", () => {
		const { result } = renderHook(() =>
			useSessionPersistence({
				originalPrompt: "",
				variableValues: {},
				promptTitle: "",
				...mockSetters,
			}),
		);

		act(() => {
			result.current.clearSessionData();
		});

		expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
			"prompt-editor-session",
		);
	});

	it("should handle invalid JSON in sessionStorage gracefully", () => {
		mockSessionStorage.getItem.mockReturnValue("invalid json");
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		renderHook(() =>
			useSessionPersistence({
				originalPrompt: "",
				variableValues: {},
				promptTitle: "",
				...mockSetters,
			}),
		);

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to load session data:",
			expect.any(Error),
		);
		expect(mockSetters.setOriginalPrompt).not.toHaveBeenCalled();

		consoleSpy.mockRestore();
	});
});
