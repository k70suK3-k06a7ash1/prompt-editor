import { useEffect } from "react";

type HooksProps = {
    setVariables: React.Dispatch<React.SetStateAction<string[]>>,
    setVariableValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
originalPrompt : string
}
export const useExtractVariables = ({originalPrompt,setVariables, setVariableValues} : HooksProps) => {
    
    // Extract variables from the prompt using regex
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        	useEffect(() => {
		if (!originalPrompt) {
			setVariables([]);
			return;
		}

		const regex = /\$\{(\w+)\}/g;
		const foundVariables = new Set<string>();
		let match : RegExpExecArray | null;

		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while ((match = regex.exec(originalPrompt)) !== null) {
			foundVariables.add(match[1]);
		}

		const uniqueVariables = Array.from(foundVariables);
		setVariables(uniqueVariables);

		// Initialize variable values for new variables and remove old ones
		setVariableValues((prev) => {
			const newVariableValues = { ...prev };

			// Add new variables
			uniqueVariables.forEach((variable) => {
				if (!(variable in newVariableValues)) {
					newVariableValues[variable] = "";
				}
			});

			// Remove values for variables that no longer exist
			Object.keys(newVariableValues).forEach((variable) => {
				if (!uniqueVariables.includes(variable)) {
					delete newVariableValues[variable];
				}
			});

			return newVariableValues;
		});
	}, [originalPrompt]);

}