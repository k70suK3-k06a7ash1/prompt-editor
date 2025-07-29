import { Copy, RotateCcw, Save, History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePGlite, useLiveQuery } from "@electric-sql/pglite-react";

interface PromptVersion {
	id: number;
	title: string;
	original_prompt: string;
	variable_values: Record<string, string>;
	created_at: string;
	updated_at: string;
}

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

	// Extract variables from the prompt using regex
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
		"Hello, my name is ${name}. I am ${age} years old and I work as a ${job}. I live in ${city}.";

	return (
		<div className="min-h-screen bg-gray-50 py-6 px-4 font-inter">
			{/* Header */}
			<div className="max-w-6xl mx-auto mb-8">
				<div className="text-center mb-6">
					<h1 className="text-4xl font-bold text-gray-900 mb-3">Prompt Editor</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Create dynamic prompts with variables, test different values, and save your work
					</p>
				</div>
				
				{/* Quick Actions */}
				<div className="flex justify-center gap-3 mb-6">
					<button
						type="button"
						onClick={() => setShowHistory(!showHistory)}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
					>
						<History size={16} />
						{showHistory ? 'Hide' : 'Browse'} Saved Prompts ({promptVersions?.rows?.length || 0})
					</button>
				</div>
			</div>

			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Input & Variables */}
					<div className="lg:col-span-2 space-y-6">
						{/* Prompt History Sidebar */}
						{showHistory && (
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold text-gray-900">
										Saved Prompts
									</h2>
									<button
										type="button"
										onClick={() => setShowHistory(false)}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										×
									</button>
								</div>
								{promptVersions?.rows && promptVersions.rows.length > 0 ? (
									<div className="space-y-3 max-h-80 overflow-y-auto">
										{promptVersions.rows.map((version: PromptVersion) => (
											<div key={version.id} className="group border border-gray-100 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
												<div className="flex items-start justify-between">
													<div className="flex-1 min-w-0">
														<h3 className="font-medium text-gray-900 truncate">{version.title}</h3>
														<p className="text-sm text-gray-500 mt-1 line-clamp-2">
															{version.original_prompt}
														</p>
														<p className="text-xs text-gray-400 mt-2">
															{new Date(version.created_at).toLocaleDateString()} at {new Date(version.created_at).toLocaleTimeString()}
														</p>
													</div>
													<div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															type="button"
															onClick={() => loadPromptVersion(version)}
															className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
														>
															Load
														</button>
														<button
															type="button"
															onClick={() => deletePromptVersion(version.id, version.title)}
															className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
														>
															<Trash2 size={14} />
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<History size={48} className="mx-auto text-gray-300 mb-3" />
										<p className="text-gray-500">No saved prompts yet</p>
										<p className="text-sm text-gray-400 mt-1">Create and save your first prompt to see it here</p>
									</div>
								)}
							</div>
						)}

						{/* Prompt Input Section */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<label
										htmlFor="original-prompt"
										className="block text-xl font-semibold text-gray-900 mb-2"
									>
										Create Your Prompt
									</label>
									<p className="text-sm text-gray-500">
										Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">${`{variableName}`}</code> to create dynamic variables
									</p>
								</div>
								<button
									type="button"
									onClick={resetPrompt}
									className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<RotateCcw size={16} />
									Clear
								</button>
							</div>
							<textarea
								id="original-prompt"
								value={originalPrompt}
								onChange={(e) => setOriginalPrompt(e.target.value)}
								placeholder={examplePrompt}
								className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
								rows={6}
							/>
							
							{/* Save Section */}
							<div className="mt-4 pt-4 border-t border-gray-100">
								<div className="flex gap-3">
									<input
										type="text"
										value={promptTitle}
										onChange={(e) => setPromptTitle(e.target.value)}
										placeholder="Give your prompt a name (optional)"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
									/>
									<button
										type="button"
										onClick={savePrompt}
										disabled={!originalPrompt.trim()}
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
									>
										<Save size={16} />
										Save
									</button>
								</div>
							</div>
						</div>

						{/* Variable Input Section */}
						{variables.length > 0 && (
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
								<div className="flex items-center gap-2 mb-4">
									<h2 className="text-xl font-semibold text-gray-900">
										Fill Variables
									</h2>
									<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
										{variables.length}
									</span>
								</div>
								<p className="text-sm text-gray-500 mb-4">
									Provide values for the variables you defined in your prompt
								</p>
								<div className="grid grid-cols-1 gap-4">
									{variables.map((variable) => (
										<div key={variable} className="space-y-2">
											<label
												htmlFor={`var-${variable}`}
												className="block text-sm font-medium text-gray-700"
											>
												<code className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">
													${`{${variable}}`}
												</code>
												{variable}
											</label>
											<input
												id={`var-${variable}`}
												type="text"
												value={variableValues[variable] || ""}
												onChange={(e) =>
													handleVariableChange(variable, e.target.value)
												}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
												placeholder={`Enter value for ${variable}`}
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Output */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold text-gray-900">
									Final Prompt
								</h2>
								<button
									type="button"
									onClick={copyToClipboard}
									disabled={!generatedPrompt}
									className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
								>
									<Copy size={16} />
									Copy
								</button>
							</div>
							<div className="bg-gray-50 rounded-lg p-4 min-h-[200px] border border-gray-200 max-h-[60vh] overflow-y-auto">
								{generatedPrompt ? (
									<pre className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
										{generatedPrompt}
									</pre>
								) : (
									<div className="text-center py-8">
										{originalPrompt ? (
											<>
												<Copy size={32} className="mx-auto text-gray-300 mb-3" />
												<p className="text-gray-500 text-sm">
													Fill in variable values to see your final prompt
												</p>
											</>
										) : (
											<>
												<Copy size={32} className="mx-auto text-gray-300 mb-3" />
												<p className="text-gray-500 text-sm">
													Create a prompt to see the output here
												</p>
											</>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PromptEditor;
