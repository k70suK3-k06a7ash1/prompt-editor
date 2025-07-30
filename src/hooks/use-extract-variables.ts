import { useEffect } from "react";

/**
 * Props interface for the useExtractVariables hook
 */
type HooksProps = {
	/** Function to update the variables state array */
	setVariables: React.Dispatch<React.SetStateAction<string[]>>;
	/** Function to update the variable values state object */
	setVariableValues: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
	/** The original prompt string to extract variables from */
	originalPrompt: string;
};

/**
 * Custom hook that extracts variables from a prompt string and manages their state
 *
 * This hook parses a prompt string looking for variables in the format ${variableName}
 * and automatically manages the state for both the list of variables and their values.
 *
 * @param params - Object containing originalPrompt and state setters
 * @param params.originalPrompt - The prompt string to parse for variables
 * @param params.setVariables - State setter for the array of variable names
 * @param params.setVariableValues - State setter for the variable values object
 *
 * @example
 * ```tsx
 * const [variables, setVariables] = useState<string[]>([]);
 * const [variableValues, setVariableValues] = useState<Record<string, string>>({});
 * const [originalPrompt, setOriginalPrompt] = useState("Hello ${name}!");
 *
 * useExtractVariables({
 *   originalPrompt,
 *   setVariables,
 *   setVariableValues
 * });
 * ```
 */
export const useExtractVariables = ({
	originalPrompt,
	setVariables,
	setVariableValues,
}: HooksProps) => {
	// Extract variables from the prompt using regex and manage their state
	// Dependency array intentionally excludes setters as they are stable references
	// biome-ignore lint/correctness/useExhaustiveDependencies: setters are stable references
	useEffect(() => {
		// Clear variables if no prompt is provided
		if (!originalPrompt) {
			setVariables([]);
			return;
		}

		// Regex pattern to match ${variableName} format
		// Captures word characters (\w+) between ${ and }
		const regex = /\$\{(\w+)\}/g;
		const foundVariables = new Set<string>();
		let match: RegExpExecArray | null;

		// Execute regex globally to find all variable matches
		// Using assignment in while condition for efficient iteration
		// biome-ignore lint/suspicious/noAssignInExpressions: Standard pattern for regex.exec() iteration
		while ((match = regex.exec(originalPrompt)) !== null) {
			// Add the captured variable name (group 1) to the set
			foundVariables.add(match[1]);
		}

		// Convert Set to Array to maintain order and provide array methods
		const uniqueVariables = Array.from(foundVariables);
		setVariables(uniqueVariables);

		// Update variable values state to sync with discovered variables
		setVariableValues((prev) => {
			const newVariableValues = { ...prev };

			// Initialize empty values for newly discovered variables
			uniqueVariables.forEach((variable) => {
				if (!(variable in newVariableValues)) {
					newVariableValues[variable] = "";
				}
			});

			// Clean up values for variables that no longer exist in the prompt
			Object.keys(newVariableValues).forEach((variable) => {
				if (!uniqueVariables.includes(variable)) {
					delete newVariableValues[variable];
				}
			});

			return newVariableValues;
		});
	}, [originalPrompt]);
};
