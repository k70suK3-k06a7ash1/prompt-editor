import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGenerateMultiPrompts } from "./use-generate-multi-prompts";

/**
 * Test suite for the useGenerateMultiPrompts custom hook
 * Tests the generation of multiple prompts from comma-separated variable values
 */
describe("useGenerateMultiPrompts", () => {
	it("should generate empty array when no originalPrompt is provided", () => {
		const mockSetGeneratedPrompts = vi.fn();

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt: "",
				variableValues: {},
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([]);
	});

	it("should generate single prompt when no comma-separated values", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}, you are ${age} years old";
		const variableValues = { name: "Alice", age: "25" };

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice, you are 25 years old",
		]);
	});

	it("should generate multiple prompts with comma-separated values", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}, you are ${age} years old";
		const variableValues = { name: "Alice,Bob", age: "25" };

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice, you are 25 years old",
			"Hello Bob, you are 25 years old",
		]);
	});

	it("should generate cartesian product for multiple variables with comma-separated values", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}, you are ${age} years old and work as ${job}";
		const variableValues = { 
			name: "Alice,Bob", 
			age: "25,30", 
			job: "developer" 
		};

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice, you are 25 years old and work as developer",
			"Hello Alice, you are 30 years old and work as developer", 
			"Hello Bob, you are 25 years old and work as developer",
			"Hello Bob, you are 30 years old and work as developer",
		]);
	});

	it("should handle whitespace in comma-separated values", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}";
		const variableValues = { name: "Alice, Bob , Charlie" };

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice",
			"Hello Bob",
			"Hello Charlie",
		]);
	});

	it("should filter out empty values after splitting", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}";
		const variableValues = { name: "Alice,,Bob," };

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice",
			"Hello Bob",
		]);
	});

	it("should preserve original placeholder when variable value is empty", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}, you are ${age} years old";
		const variableValues = { name: "Alice", age: "" };

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice, you are ${age} years old",
		]);
	});

	it("should handle complex cartesian product with three variables", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "${greeting} ${name}, welcome to ${city}";
		const variableValues = { 
			greeting: "Hello,Hi", 
			name: "Alice,Bob", 
			city: "NYC,LA" 
		};

		renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith([
			"Hello Alice, welcome to NYC",
			"Hello Alice, welcome to LA",
			"Hello Bob, welcome to NYC", 
			"Hello Bob, welcome to LA",
			"Hi Alice, welcome to NYC",
			"Hi Alice, welcome to LA",
			"Hi Bob, welcome to NYC",
			"Hi Bob, welcome to LA",
		]);
	});

	it("should update when originalPrompt changes", () => {
		const mockSetGeneratedPrompts = vi.fn();
		let originalPrompt = "Hello ${name}";
		const variableValues = { name: "Alice" };

		const { rerender } = renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith(["Hello Alice"]);

		// Change the original prompt
		originalPrompt = "Hi ${name}";
		rerender();

		expect(mockSetGeneratedPrompts).toHaveBeenLastCalledWith(["Hi Alice"]);
	});

	it("should update when variableValues change", () => {
		const mockSetGeneratedPrompts = vi.fn();
		const originalPrompt = "Hello ${name}";
		let variableValues = { name: "Alice" };

		const { rerender } = renderHook(() =>
			useGenerateMultiPrompts({
				originalPrompt,
				variableValues,
				setGeneratedPrompts: mockSetGeneratedPrompts,
			}),
		);

		expect(mockSetGeneratedPrompts).toHaveBeenCalledWith(["Hello Alice"]);

		// Change variable values to comma-separated
		variableValues = { name: "Alice,Bob" };
		rerender();

		expect(mockSetGeneratedPrompts).toHaveBeenLastCalledWith([
			"Hello Alice",
			"Hello Bob",
		]);
	});
});