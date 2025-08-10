import { useEffect } from "react";

/**
 * Props interface for the useGenerateMultiPrompts hook
 */
export interface UseGenerateMultiPromptsProps {
	originalPrompt: string;
	variableValues: Record<string, string>;
	setGeneratedPrompts: (prompts: string[]) => void;
}

/**
 * Custom hook to generate multiple prompts from comma-separated variable values
 * 
 * This hook extends the basic prompt generation functionality to support creating
 * multiple prompts when any variable contains comma-separated values.
 * 
 * @param originalPrompt - The template prompt containing ${variable} placeholders
 * @param variableValues - Object mapping variable names to their values (may contain commas)
 * @param setGeneratedPrompts - State setter function for the generated prompts array
 * 
 * @example
 * // For prompt "Hello ${name}, you are ${age} years old"
 * // With variableValues: { name: "Alice,Bob,Charlie", age: "25,30" }
 * // Generates:
 * // - "Hello Alice, you are 25 years old"
 * // - "Hello Alice, you are 30 years old" 
 * // - "Hello Bob, you are 25 years old"
 * // - "Hello Bob, you are 30 years old"
 * // - "Hello Charlie, you are 25 years old"
 * // - "Hello Charlie, you are 30 years old"
 */
export const useGenerateMultiPrompts = ({
	originalPrompt,
	variableValues,
	setGeneratedPrompts,
}: UseGenerateMultiPromptsProps) => {
	// Generate multiple prompts by creating all combinations of comma-separated values
	// Dependency array intentionally excludes setter as it is a stable reference
	// biome-ignore lint/correctness/useExhaustiveDependencies: setter is a stable reference
	// eslint-disable-next-line react-hooks/exhaustive-deps
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
					useEffect(() => {
		// Clear generated prompts if no original prompt is provided
		if (!originalPrompt) {
			setGeneratedPrompts([]);
			return;
		}

		// Parse comma-separated values for each variable
		const variableOptions: Record<string, string[]> = {};
		let hasMultipleValues = false;

		Object.entries(variableValues).forEach(([variable, value]) => {
			if (value) {
				// Split by comma, trim whitespace, and filter out empty strings
				const options = value.split(",").map(v => v.trim()).filter(v => v.length > 0);
				variableOptions[variable] = options.length > 0 ? options : [""];
				
				// Track if any variable has multiple values
				if (options.length > 1) {
					hasMultipleValues = true;
				}
			} else {
				// Keep original placeholder format if no value provided
				variableOptions[variable] = [`\${${variable}}`];
			}
		});

		// If no variables have multiple values, generate single prompt
		if (!hasMultipleValues) {
			let result = originalPrompt;
			Object.entries(variableValues).forEach(([variable, value]) => {
				const regex = new RegExp(`\\$\\{${variable}\\}`, "g");
				result = result.replace(regex, value || `\${${variable}}`);
			});
			setGeneratedPrompts([result]);
			return;
		}

		// Generate all possible combinations using cartesian product
		const variableNames = Object.keys(variableOptions);
		const combinations: Record<string, string>[] = [];

		const generateCombinations = (index: number, currentCombination: Record<string, string>) => {
			if (index >= variableNames.length) {
				combinations.push({ ...currentCombination });
				return;
			}

			const variable = variableNames[index];
			const options = variableOptions[variable];

			for (const option of options) {
				currentCombination[variable] = option;
				generateCombinations(index + 1, currentCombination);
			}
		};

		generateCombinations(0, {});

		// Generate prompts for each combination
		const generatedPrompts = combinations.map(combination => {
			let result = originalPrompt;
			
			Object.entries(combination).forEach(([variable, value]) => {
				const regex = new RegExp(`\\$\\{${variable}\\}`, "g");
				result = result.replace(regex, value);
			});
			
			return result;
		});

		// Update the generated prompts state
		setGeneratedPrompts(generatedPrompts);
	}, [originalPrompt, variableValues]);
};