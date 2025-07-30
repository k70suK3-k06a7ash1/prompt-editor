import { Copy, RotateCcw, Save, History, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePGlite, useLiveQuery } from "@electric-sql/pglite-react";
import type { PromptVersion } from "@/types";
import { useExtractVariables } from "@/hooks/use-extract-variables";
import { useGeneratePrompt } from "@/hooks/use-generate-prompt";

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

	useExtractVariables({originalPrompt, setVariables, setVariableValues});
	useGeneratePrompt({originalPrompt, variableValues, setGeneratedPrompt});

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
			console.error('Failed to copy text: ', err);
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
				[title, originalPrompt, JSON.stringify(variableValues)]
			);
			toast.success("Prompt saved successfully!");
			setPromptTitle("");
		} catch (err) {
			console.error('Failed to save prompt:', err);
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
			console.error('Failed to delete prompt:', err);
			toast.error("Failed to delete prompt");
		}
	};

	const examplePrompt =
		"Hello, my name is $\{name}. I am $\{age} years old and I work as a $\{job}. I live in $\{city}.";

	return (
		<div className="min-h-screen min-w-screen bg-gray-50 py-8 px-4 font-inter">

			<div className="max-w-4xl mx-auto">
							<h1 className="text-center text-3xl font-bold text-gray-900 mb-2 mx-auto">Prompt Editor</h1>

				<div className="mb-8 text-center">
					<p className="text-gray-600">
						Extract variables from your prompt and generate customized output
					</p>
				</div>

				<div className="space-y-8">
					{/* Save Prompt Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex gap-4 items-center">
							<input
								type="text"
								value={promptTitle}
								onChange={(e) => setPromptTitle(e.target.value)}
								placeholder="Enter prompt title (optional)"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<button
								type="button"
								onClick={savePrompt}
								disabled={!originalPrompt.trim()}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Save size={16} />
								Save Prompt
							</button>
							<button
								type="button"
								onClick={() => setShowHistory(!showHistory)}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
							>
								<History size={16} />
								{showHistory ? 'Hide' : 'Show'} History
							</button>
						</div>
					</div>

					{/* History Section */}
					{showHistory && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">
								Prompt History ({promptVersions?.rows?.length || 0})
							</h2>
							{promptVersions?.rows && promptVersions.rows.length > 0 ? (
								<div className="space-y-3 max-h-64 overflow-y-auto">
									{promptVersions.rows.map((version: PromptVersion) => (
										<div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
											<div className="flex-1">
												<h3 className="font-medium text-gray-900">{version.title}</h3>
												<p className="text-sm text-gray-500 truncate max-w-md">
													{version.original_prompt}
												</p>
												<p className="text-xs text-gray-400">
													{new Date(version.created_at).toLocaleString()}
												</p>
											</div>
											<div className="flex gap-2 ml-4">
												<button
													type="button"
													onClick={() => loadPromptVersion(version)}
													className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
												>
													Load
												</button>
												<button
													type="button"
													onClick={() => deletePromptVersion(version.id, version.title)}
													className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
												>
													<Trash2 size={12} />
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 text-center py-4">No saved prompts yet</p>
							)}
						</div>
					)}

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
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold text-gray-900">
								Generated Prompt
							</h2>
							<button
								type="button"
								onClick={copyToClipboard}
								disabled={!generatedPrompt}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Copy size={16} />
								Copy
							</button>
						</div>
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
