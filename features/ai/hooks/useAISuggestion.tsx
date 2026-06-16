import { Extensions } from "@prisma/client/runtime/library";
import { useState, useCallback } from "react";

interface AISuggestionsState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: any) => Promise<void>;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => any;
  clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {

    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
    });

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({
        ...prev,
        isEnabled: !prev.isEnabled,
        }));
    },[]);

// FIX - move logic outside setState
const fetchSuggestion = useCallback(async (type: string, editor: any) => {
    if (!state.isEnabled || !editor) return;

    const model = editor.getModel();
    const cursorPosition = editor.getPosition();
    if (!model || !cursorPosition) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
        const payload = {
            fileContent: model.getValue(),
            cursorLine: cursorPosition.lineNumber - 1,
            cursorColumn: cursorPosition.column - 1,
            suggestionType: type,
        };

        const response = await fetch("/api/code-suggestion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`API error ${response.status}`);

        const data = await response.json();

        console.log("💡 Full API response:", data);
        console.log("💡 Suggestion text:", data.suggestion);

        if (data.suggestion) {
            console.log("✅ Setting suggestion in state...");
            setState((prev) => ({
                ...prev,
                suggestion: data.suggestion.trim(),
                position: {
                    line: cursorPosition.lineNumber,
                    column: cursorPosition.column,
                },
                isLoading: false,
            }));
        } else {
            console.log("❌ No suggestion in response, data was:", data);
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    } catch (error) {
        console.error("Error fetching suggestion:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
    }
}, [state.isEnabled]); 

const acceptSuggestion = useCallback((editor: any, monaco: any) => {
    setState((currentState) => {
        if (
            !currentState.suggestion ||
            !currentState.position ||
            !editor
        ) {
            return currentState;
        }

        const { line, column } = currentState.position;

        const sanitizedSuggestion = currentState.suggestion.replace(
            /^\d+:\s*/gm,
            ""
        );

        editor.executeEdits("", [
            {
                range: new monaco.Range(line, column, line, column),
                text: sanitizedSuggestion,
                forceMoveMarkers: true,
            },
        ]);

        if (editor && currentState.decoration.length > 0) {
            editor.deltaDecorations(currentState.decoration, []);
        }

        return {
            ...currentState,
            suggestion: null,
            position: null,
            decoration: [],
        };
    });
}, []);

    const rejectSuggestion = useCallback((editor: any) => {
        setState((currentState) => {
            if (editor && currentState.decoration.length > 0) {
            editor.deltaDecorations(currentState.decoration, []);
            }

            return {
            ...currentState,
            suggestion: null,
            position: null,
            decoration: [],
            };
        });     
    }, []);   

    const clearSuggestion = useCallback((editor: any) => {
        setState((currentState) => {
            if (editor && currentState.decoration.length > 0) {
            editor.deltaDecorations(currentState.decoration, []);
            }

            return {
            ...currentState,
            suggestion: null,
            position: null,
            decoration: [],
            };
        });
    },[]);

    return{
        ...state,
        toggleEnabled,
        fetchSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        clearSuggestion,
    };

};