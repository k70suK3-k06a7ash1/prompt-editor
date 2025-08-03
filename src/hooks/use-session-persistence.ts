import { useCallback, useEffect, useRef } from "react";

interface SessionData {
	originalPrompt: string;
	variableValues: Record<string, string>;
	promptTitle: string;
	lastModified: number;
}

interface UseSessionPersistenceProps {
	originalPrompt: string;
	variableValues: Record<string, string>;
	promptTitle: string;
	setOriginalPrompt: (prompt: string) => void;
	setVariableValues: (values: Record<string, string>) => void;
	setPromptTitle: (title: string) => void;
	autoSaveEnabled?: boolean;
	debounceMs?: number;
}

export const useSessionPersistence = ({
	originalPrompt,
	variableValues,
	promptTitle,
	setOriginalPrompt,
	setVariableValues,
	setPromptTitle,
	autoSaveEnabled = true,
	debounceMs = 1000,
}: UseSessionPersistenceProps) => {
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hasUnsavedChangesRef = useRef(false);
	const lastSavedDataRef = useRef<SessionData | null>(null);

	const STORAGE_KEY = "prompt-editor-session";

	const saveSessionData = useCallback((data: SessionData) => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (error) {
			console.warn("Failed to save session data:", error);
		}
	}, []);

	const loadSessionData = useCallback((): SessionData | null => {
		try {
			const saved = sessionStorage.getItem(STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved) as SessionData;
				// Only restore if saved within last 24 hours
				if (Date.now() - data.lastModified < 24 * 60 * 60 * 1000) {
					return data;
				}
			}
		} catch (error) {
			console.warn("Failed to load session data:", error);
		}
		return null;
	}, []);

	// Load session data on mount
	useEffect(() => {
		const savedData = loadSessionData();
		if (savedData) {
			setOriginalPrompt(savedData.originalPrompt);
			setVariableValues(savedData.variableValues);
			setPromptTitle(savedData.promptTitle);
			lastSavedDataRef.current = savedData;
		}
	}, [setOriginalPrompt, setVariableValues, setPromptTitle, loadSessionData]);

	// Save session data with debouncing
	useEffect(() => {
		if (!autoSaveEnabled) return;

		const currentData: SessionData = {
			originalPrompt,
			variableValues,
			promptTitle,
			lastModified: Date.now(),
		};

		// Check if data has actually changed
		const hasChanged =
			!lastSavedDataRef.current ||
			JSON.stringify(currentData) !==
				JSON.stringify({
					...lastSavedDataRef.current,
					lastModified: lastSavedDataRef.current.lastModified,
				});

		if (hasChanged) {
			hasUnsavedChangesRef.current = true;

			// Clear existing timeout
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}

			// Set new timeout
			debounceTimeoutRef.current = setTimeout(() => {
				saveSessionData(currentData);
				lastSavedDataRef.current = currentData;
				hasUnsavedChangesRef.current = false;
			}, debounceMs);
		}

		// Cleanup function
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [
		originalPrompt,
		variableValues,
		promptTitle,
		autoSaveEnabled,
		debounceMs,
		saveSessionData,
	]);

	// Save immediately before page unload
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (hasUnsavedChangesRef.current) {
				const currentData: SessionData = {
					originalPrompt,
					variableValues,
					promptTitle,
					lastModified: Date.now(),
				};
				saveSessionData(currentData);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [originalPrompt, variableValues, promptTitle, saveSessionData]);

	const clearSessionData = useCallback(() => {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
			lastSavedDataRef.current = null;
			hasUnsavedChangesRef.current = false;
		} catch (error) {
			console.warn("Failed to clear session data:", error);
		}
	}, []);

	const hasUnsavedChanges = useCallback(() => hasUnsavedChangesRef.current, []);

	const manualSave = useCallback(() => {
		const currentData: SessionData = {
			originalPrompt,
			variableValues,
			promptTitle,
			lastModified: Date.now(),
		};
		saveSessionData(currentData);
		lastSavedDataRef.current = currentData;
		hasUnsavedChangesRef.current = false;
	}, [originalPrompt, variableValues, promptTitle, saveSessionData]);

	return {
		clearSessionData,
		hasUnsavedChanges,
		saveSessionData: manualSave,
	};
};
