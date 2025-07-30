import { useEffect } from "react";

/**
 * Props interface for the useGeneratePrompt hook
 */
type UseGeneratePromptProps = {
    /** The original prompt string with variables */
    originalPrompt: string;
    /** Object mapping variable names to their values */
    variableValues: Record<string, string>;
    /** Function to update the generated prompt state */
    setGeneratedPrompt: React.Dispatch<React.SetStateAction<string>>;
};

/**
 * Custom hook that generates a final prompt by replacing variables with their values
 * 
 * This hook takes an original prompt containing variables in ${variableName} format
 * and replaces them with the corresponding values from variableValues object.
 * If a variable doesn't have a value, it keeps the original ${variableName} format.
 * 
 * @param params - Object containing originalPrompt, variableValues, and state setter
 * @param params.originalPrompt - The prompt string containing variables to replace
 * @param params.variableValues - Object mapping variable names to their replacement values
 * @param params.setGeneratedPrompt - State setter for the final generated prompt
 * 
 * @example
 * ```tsx
 * const [originalPrompt, setOriginalPrompt] = useState("Hello ${name}!");
 * const [variableValues, setVariableValues] = useState({ name: "World" });
 * const [generatedPrompt, setGeneratedPrompt] = useState("");
 * 
 * useGeneratePrompt({
 *   originalPrompt,
 *   variableValues,
 *   setGeneratedPrompt
 * });
 * // generatedPrompt will be "Hello World!"
 * ```
 */
export const useGeneratePrompt = ({
    originalPrompt,
    variableValues,
    setGeneratedPrompt
}: UseGeneratePromptProps) => {
    
    // Generate the final prompt by replacing variables with their values
    // Dependency array intentionally excludes setter as it is a stable reference
    // biome-ignore lint/correctness/useExhaustiveDependencies: setter is a stable reference
    useEffect(() => {
        // Clear generated prompt if no original prompt is provided
        if (!originalPrompt) {
            setGeneratedPrompt("");
            return;
        }

        // Start with the original prompt and replace variables
        let result = originalPrompt;
        
        // Iterate through each variable and its value
        Object.entries(variableValues).forEach(([variable, value]) => {
            // Create regex to match ${variableName} globally
            const regex = new RegExp(`\\$\\{${variable}\\}`, "g");
            // Replace with value, or keep original format if no value provided
            result = result.replace(regex, value || `\${${variable}}`);
        });

        // Update the generated prompt state
        setGeneratedPrompt(result);
    }, [originalPrompt, variableValues]);
};