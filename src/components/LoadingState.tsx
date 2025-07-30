import { Loader2 } from "lucide-react";

export default function LoadingState() {
	return (
		<div className="min-h-screen min-w-screen bg-gray-50 py-8 px-4 font-inter flex items-center justify-center">
			<div className="max-w-md mx-auto">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
					<Loader2 className="mx-auto h-10 w-10 md:h-12 md:w-12 animate-spin text-blue-600 mb-6" />
					<h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
						Initializing Database
					</h2>
					<p className="text-sm md:text-base text-gray-600 leading-relaxed">
						Setting up your prompt editor workspace...
					</p>
				</div>
			</div>
		</div>
	);
}
