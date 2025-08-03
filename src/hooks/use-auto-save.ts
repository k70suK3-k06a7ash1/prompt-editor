import { useCallback, useEffect, useRef, useState } from "react";
import type { PromptRepository } from "@/repositories/PromptRepository";

interface UseAutoSaveProps {
	originalPrompt: string;
	variableValues: Record<string, string>;
	promptRepository: PromptRepository;
	enabled?: boolean;
	debounceMs?: number;
	minContentLength?: number;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useAutoSave = ({
	originalPrompt,
	variableValues,
	promptRepository,
	enabled = true,
	debounceMs = 2000,
	minContentLength = 10,
}: UseAutoSaveProps) => {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
	const [autoSaveId, setAutoSaveId] = useState<number | null>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastSavedContentRef = useRef<string>("");

	const AUTOSAVE_PREFIX = "[Auto-save]";

	const performAutoSave = useCallback(async () => {
		if (!originalPrompt.trim() || originalPrompt.length < minContentLength) {
			return;
		}

		// Don't save if content hasn't changed
		const currentContent = JSON.stringify({ originalPrompt, variableValues });
		if (currentContent === lastSavedContentRef.current) {
			return;
		}

		setSaveStatus("saving");

		try {
			const title = `${AUTOSAVE_PREFIX} ${new Date().toLocaleString()}`;

			let savedId: number;
			if (autoSaveId) {
				// Update existing auto-save
				await promptRepository.updatePrompt(
					autoSaveId,
					title,
					originalPrompt,
					variableValues,
				);
				savedId = autoSaveId;
			} else {
				// Create new auto-save
				savedId = await promptRepository.savePrompt(
					title,
					originalPrompt,
					variableValues,
				);
				setAutoSaveId(savedId);
			}

			lastSavedContentRef.current = currentContent;
			setLastSavedAt(new Date());
			setSaveStatus("saved");

			// Reset status after 3 seconds
			setTimeout(() => setSaveStatus("idle"), 3000);
		} catch (error) {
			console.error("Auto-save failed:", error);
			setSaveStatus("error");
			setTimeout(() => setSaveStatus("idle"), 3000);
		}
	}, [
		originalPrompt,
		variableValues,
		promptRepository,
		autoSaveId,
		minContentLength,
	]);

	// Debounced auto-save effect
	useEffect(() => {
		if (!enabled || !originalPrompt.trim()) {
			return;
		}

		// Clear existing timeout
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		// Set new timeout
		debounceTimeoutRef.current = setTimeout(() => {
			performAutoSave();
		}, debounceMs);

		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [originalPrompt, variableValues, enabled, debounceMs, performAutoSave]);

	const clearAutoSave = useCallback(async () => {
		if (autoSaveId) {
			try {
				await promptRepository.deletePrompt(autoSaveId);
				setAutoSaveId(null);
				lastSavedContentRef.current = "";
				setLastSavedAt(null);
				setSaveStatus("idle");
			} catch (error) {
				console.error("Failed to clear auto-save:", error);
			}
		}
	}, [autoSaveId, promptRepository]);

	const purgeAllAutoSaves = useCallback(async () => {
		try {
			await promptRepository.deleteAutoSaves();
			setAutoSaveId(null);
			lastSavedContentRef.current = "";
			setLastSavedAt(null);
			setSaveStatus("idle");
		} catch (error) {
			console.error("Failed to purge auto-saves:", error);
		}
	}, [promptRepository]);

	const manualSave = useCallback(async () => {
		await performAutoSave();
	}, [performAutoSave]);

	return {
		saveStatus,
		lastSavedAt,
		clearAutoSave,
		purgeAllAutoSaves,
		manualSave,
		isAutoSave: (title: string) => title.startsWith(AUTOSAVE_PREFIX),
	};
};
