import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { Copy, History, RotateCcw, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useExtractVariables } from "@/hooks/use-extract-variables";
import { useGeneratePrompt } from "@/hooks/use-generate-prompt";
import type { PromptVersion } from "@/types";

const PromptEditor = () => {
	const db = usePGlite();
	const [originalPrompt, setOriginalPrompt] = useState("");
	const [variables, setVariables] = useState<string[]>([]);
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);
	const [generatedPrompt, setGeneratedPrompt] = useState("");
	const [promptTitle, setPromptTitle] = useState("");
	const [showHistory, setShowHistory] = useState(false);

	// Get all prompt versions from database
	const promptVersions = useLiveQuery<PromptVersion>(
		"SELECT * FROM prompt_versions ORDER BY created_at DESC",
	);

	useExtractVariables({ originalPrompt, setVariables, setVariableValues });
	useGeneratePrompt({ originalPrompt, variableValues, setGeneratedPrompt });

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

	const copyToClipboard = async () => {
		if (!generatedPrompt) return;

		try {
			await navigator.clipboard.writeText(generatedPrompt);
			toast.success("Prompt copied to clipboard!");
		} catch (err) {
			console.error("Failed to copy text: ", err);
			toast.error("Failed to copy prompt to clipboard");
		}
	};

	const savePrompt = async () => {
		if (!originalPrompt.trim()) {
			toast.error("Please enter a prompt to save");
			return;
		}

		const title = promptTitle.trim() || `Prompt ${new Date().toLocaleString()}`;

		try {
			await db.query(
				"INSERT INTO prompt_versions (title, original_prompt, variable_values) VALUES ($1, $2, $3)",
				[title, originalPrompt, JSON.stringify(variableValues)],
			);
			toast.success("Prompt saved successfully!");
			setPromptTitle("");
		} catch (err) {
			console.error("Failed to save prompt:", err);
			toast.error("Failed to save prompt");
		}
	};

	const loadPromptVersion = (version: PromptVersion) => {
		setOriginalPrompt(version.original_prompt);
		setVariableValues(version.variable_values);
		toast.success(`Loaded: ${version.title}`);
	};

	const deletePromptVersion = async (id: number, title: string) => {
		try {
			await db.query("DELETE FROM prompt_versions WHERE id = $1", [id]);
			toast.success(`Deleted: ${title}`);
		} catch (err) {
			console.error("Failed to delete prompt:", err);
			toast.error("Failed to delete prompt");
		}
	};

	const examplePrompt =
		"Hello, my name is $\{name}. I am $\{age} years old and I work as a $\{job}. I live in $\{city}.";

	return (
		<div className="min-h-screen w-full bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-inter overflow-x-hidden">
			<div className="max-w-4xl mx-auto w-full">
				<h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2 mx-auto">
					Prompt Editor
				</h1>

				<div className="mb-6 sm:mb-8 text-center">
					<p className="text-sm sm:text-base text-gray-600">
						Extract variables from your prompt and generate customized output
					</p>
				</div>

				<div className="space-y-6 sm:space-y-8 w-full">
					{/* Save Prompt Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
						<div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-center">
							<input
								type="text"
								value={promptTitle}
								onChange={(e) => setPromptTitle(e.target.value)}
								placeholder="Enter prompt title (optional)"
								className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
							/>
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
								<button
									type="button"
									onClick={savePrompt}
									disabled={!originalPrompt.trim()}
									className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
								>
									<Save size={16} />
									Save Prompt
								</button>
								<button
									type="button"
									onClick={() => setShowHistory(!showHistory)}
									className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
								>
									<History size={16} />
									{showHistory ? "Hide" : "Show"} History
								</button>
							</div>
						</div>
					</div>

					{/* History Section */}
					{showHistory && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
							<h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
								Prompt History ({promptVersions?.rows?.length || 0})
							</h2>
							{promptVersions?.rows && promptVersions.rows.length > 0 ? (
								<div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
									{promptVersions.rows.map((version: PromptVersion) => (
										<div
											key={version.id}
											className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md gap-3 sm:gap-0"
										>
											<div className="flex-1 min-w-0">
												<h3 className="font-medium text-gray-900 truncate">
													{version.title}
												</h3>
												<p className="text-sm text-gray-500 truncate">
													{version.original_prompt}
												</p>
												<p className="text-xs text-gray-400">
													{new Date(version.created_at).toLocaleString()}
												</p>
											</div>
											<div className="flex gap-2 shrink-0">
												<button
													type="button"
													onClick={() => loadPromptVersion(version)}
													className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
												>
													Load
												</button>
												<button
													type="button"
													onClick={() =>
														deletePromptVersion(version.id, version.title)
													}
													className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
												>
													<Trash2 size={12} />
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 text-center py-4">
									No saved prompts yet
								</p>
							)}
						</div>
					)}

					{/* Prompt Input Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
							<label
								htmlFor="original-prompt"
								className="block text-base sm:text-lg font-semibold text-gray-900"
							>
								System Prompt
							</label>
							<button
								type="button"
								onClick={resetPrompt}
								className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap self-start sm:self-auto"
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
							className="w-full h-32 sm:h-40 px-3 sm:px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
							rows={4}
						/>
						<p className="mt-2 text-xs sm:text-sm text-gray-500">
							Enter your prompt with variables in the format: $
							{`{variableName}`}
						</p>
					</div>

					{/* Variable Input Section */}
					{variables.length > 0 && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
							<h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
								Variables ({variables.length})
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
											placeholder={`Enter value for ${variable}`}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Generated Prompt Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Generated Prompt
							</h2>
							<button
								type="button"
								onClick={copyToClipboard}
								disabled={!generatedPrompt}
								className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-start sm:self-auto"
							>
								<Copy size={16} />
								Copy
							</button>
						</div>
						<div className="bg-gray-50 rounded-md p-3 sm:p-4 min-h-[120px] sm:min-h-[150px] border border-gray-200">
							<pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-900 font-mono leading-relaxed">
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
