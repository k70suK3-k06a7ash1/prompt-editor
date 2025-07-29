import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const PromptEditor = () => {
	const [originalPrompt, setOriginalPrompt] = useState("");
	const [variables, setVariables] = useState<string[]>([]);
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);
	const [generatedPrompt, setGeneratedPrompt] = useState("");

	// Extract variables from the prompt using regex
	useEffect(() => {
		if (!originalPrompt) {
			setVariables([]);
			return;
		}

		const regex = /\$\{(\w+)\}/g;
		const foundVariables = new Set<string>();
		let match;

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

	// Generate the final prompt by replacing variables with their values
	useEffect(() => {
		if (!originalPrompt) {
			setGeneratedPrompt("");
			return;
		}

		let result = originalPrompt;
		Object.entries(variableValues).forEach(([variable, value]) => {
			const regex = new RegExp(`\\$\\{${variable}\\}`, "g");
			result = result.replace(regex, value || `\${${variable}}`);
		});

		setGeneratedPrompt(result);
	}, [originalPrompt, variableValues]);

	const handleVariableChange = (variable: string, value: string) => {
		setVariableValues((prev) => ({
			...prev,
			[variable]: value,
		}));
	};

	const resetPrompt = () => {
		setOriginalPrompt("");
		setVariables([]);
		setVariableValues({});
		setGeneratedPrompt("");
	};

	const examplePrompt =
		"Hello, my name is ${name}. I am ${age} years old and I work as a ${job}. I live in ${city}.";

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 font-inter">
			<h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Editor</h1>

			<div className="max-w-4xl mx-auto">
				<div className="mb-8 text-center">
					<p className="text-gray-600">
						Extract variables from your prompt and generate customized output
					</p>
				</div>

				<div className="space-y-8">
					{/* Prompt Input Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex justify-between items-center mb-4">
							<label
								htmlFor="original-prompt"
								className="block text-lg font-semibold text-gray-900"
							>
								System Prompt
							</label>
							<button
              type="button"
								onClick={resetPrompt}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
							>
								<RotateCcw size={16} />
								Reset Prompt
							</button>
						</div>
						<textarea
							id="original-prompt"
							value={originalPrompt}
							onChange={(e) => setOriginalPrompt(e.target.value)}
							placeholder={examplePrompt}
							className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							rows={4}
						/>
						<p className="mt-2 text-sm text-gray-500">
							Enter your prompt with variables in the format: $
							{`{variableName}`}
						</p>
					</div>

					{/* Variable Input Section */}
					{variables.length > 0 && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">
								Variables ({variables.length})
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{variables.map((variable) => (
									<div key={variable} className="space-y-2">
										<label
											htmlFor={`var-${variable}`}
											className="block text-sm font-medium text-gray-700"
										>
											{variable}
										</label>
										<input
											id={`var-${variable}`}
											type="text"
											value={variableValues[variable] || ""}
											onChange={(e) =>
												handleVariableChange(variable, e.target.value)
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder={`Enter value for ${variable}`}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Generated Prompt Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Generated Prompt
						</h2>
						<div className="bg-gray-50 rounded-md p-4 min-h-[120px] border border-gray-200">
							<pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
								{generatedPrompt ||
									(originalPrompt
										? "Enter values for variables to see the generated prompt..."
										: "Enter a system prompt above to get started...")}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PromptEditor;
