import { Loader2 } from "lucide-react";

export default function LoadingState() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="text-center">
				<Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
				<p className="text-gray-600">Initializing database...</p>
			</div>
		</div>
	);
}