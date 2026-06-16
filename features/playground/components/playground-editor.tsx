"use client"
import React,{useRef,useEffect,useCallback} from "react"
import Editor,{type Monaco} from "@monaco-editor/react"
import { TemplateFile } from "../libs/path-to-json"
import { configureMonaco,defaultEditorOptions,getEditorLanguage } from "../libs/editor-config"

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined
  content: string
  onContentChange: (value: string) => void
  suggestion: string | null
  suggestionLoading: boolean
  suggestionPosition: { line: number; column: number } | null
  onAcceptSuggestion: (editor: any, monaco: any) => void
  onRejectSuggestion: (editor: any) => void
  onTriggerSuggestion: (type: string, editor: any) => void
}

const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const inlineCompletionProviderRef = useRef<any>(null)
  const currentSuggestionRef = useRef<{
    text: string;
    id: string
  } | null>(null)
  const isAcceptingSuggestionRef = useRef(false)
  const suggestionAcceptedRef = useRef(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabCommandRef = useRef<any>(null)

  // Generate unique ID for each suggestion
  const generateSuggestionId = () => `suggestion-${Date.now()}-${Math.random()}`

  // Create inline completion provider
  const createInlineCompletionProvider = useCallback(
    (monaco: Monaco) => ({

      provideInlineCompletions: () => {
        if (
          !suggestion ||
          isAcceptingSuggestionRef.current ||
          suggestionAcceptedRef.current
        ) {
          return { items: [] };
        }

        const suggestionId = generateSuggestionId();

        currentSuggestionRef.current = {
          text: suggestion,
          id: suggestionId,
        };

        const cleanSuggestion = suggestion.replace(/\r/g, "");      
          
        return {
          items: [
            {
              insertText: cleanSuggestion,
              range: new monaco.Range(
                  editorRef.current.getPosition().line,
                  editorRef.current.getPosition().column,
                  editorRef.current.getPosition().line,
                  editorRef.current.getPosition().column,
              ),
              kind: monaco.languages.CompletionItemKind.Snippet,
              label: "AI Suggestion",
              detail: "AI-generated code suggestion",
              documentation: "Press Tab to accept",
              sortText: "0000", // High priority
              filterText: "",
              //prevent monaco from insertng text itself
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitspace,
            },
          ],
        }
      },
      freeInlineCompletions: () => {},
      }),
    [suggestion],
  )

  // Clear current suggestion
  const clearCurrentSuggestion = useCallback(() => {
    console.log("Clearing current suggestion")
    currentSuggestionRef.current = null
    suggestionAcceptedRef.current = false
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
    }
  }, []) 

 // Accept current suggestion with double-acceptance prevention
  const acceptCurrentSuggestion = useCallback(() => {

    if (!editorRef.current || !monacoRef.current || !currentSuggestionRef.current) {
      console.log("Cannot accept suggestion - missing refs")
      return false
    }
    // CRITICAL: Prevent double acceptance with immediate flag setting
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("BLOCKED: Already accepting/accepted suggestion, skipping")
      return false
    }

    // Set flags IMMEDIATELY to prevent any race conditions
    isAcceptingSuggestionRef.current = true
    suggestionAcceptedRef.current = true

    
    //const currentSuggestion = currentSuggestionRef.current

    try {
      const editor = editorRef.current
      const monaco = monacoRef.current
      // Clean the suggestion text (remove \r characters)
      const cleanSuggestionText = currentSuggestionRef.current.text.replace(/\r/g, "")
      const position=editor.getPosition()

      // Safety: Prevent duplicate if already inserted
      const modelTextAtCursor = editor
        .getModel()
        .getValueInRange(
          new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column + cleanSuggestionText.length
          )
        );

      if (modelTextAtCursor === cleanSuggestionText) {
        console.log("Suggestion already inserted at cursor");
        return false;
      }

      // Insert the suggestion text at the correct position
      const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)

      // Use executeEdits to insert the text
      editor.executeEdits("ai-suggestion", [
        {
          range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ])

      // Calculate new cursor position
      const lines = cleanSuggestionText.split("\n")
      const endLine = position.lineNumber + lines.length - 1
      const endColumn =
        lines.length === 1 ? position.column + cleanSuggestionText.length : lines[lines.length - 1].length + 1

      // Move cursor to end of inserted text
      editor.setPosition({ lineNumber: endLine, column: endColumn })

      // console.log("SUCCESS: Suggestion accepted, new position:", `${endLine}:${endColumn}`)

      // Clear the suggestion
      clearCurrentSuggestion()

      // Call the parent's accept handler
      onAcceptSuggestion(editor, monaco)

      return true
    } catch (error) {
      console.error("Error accepting suggestion:", error)
      return false
    } finally {
      // Reset accepting flag immediately
      isAcceptingSuggestionRef.current = false

      // Keep accepted flag for longer to prevent immediate re-acceptance
      setTimeout(() => {
        suggestionAcceptedRef.current = false
        console.log("Reset suggestionAcceptedRef flag")
      }, 1000) // Increased delay to 1 second
    }
  }, [onAcceptSuggestion, clearCurrentSuggestion]) 
 
  // Check if there's an active inline suggestion at current position
  // const hasActiveSuggestionAtPosition = useCallback(() => {
  //   if (!editorRef.current || !currentSuggestionRef.current) return false

  //   const position = editorRef.current.getPosition()
  //   const suggestion = currentSuggestionRef.current

  //   return (
  //     position.lineNumber === suggestion.position.line &&
  //     position.column >= suggestion.position.column &&
  //     position.column <= suggestion.position.column + 2
  //   )
  // }, [])

 // Update inline completions when suggestion changes
  // useEffect(() => {
  //   if (!editorRef.current || !monacoRef.current) return

  //   // const editor = editorRef.current
  //   // const monaco = monacoRef.current

  //   if (inlineCompletionProviderRef.current) {
  //     inlineCompletionProviderRef.current.dispose();
  //   }

  //   currentSuggestionRef.current = null;

  //   if (suggestion) {
  //     const language = getEditorLanguage(
  //       activeFile?.fileExtension || ""
  //     );
  //     const provider = createInlineCompletionProvider(
  //       monacoRef.current
  //     );

  //     inlineCompletionProviderRef.current =
  //       monacoRef.current.languages.registerInlineCompletionsProvider(
  //         language,
  //         provider
  //       );

  //     setTimeout(() => {
  //       editorRef.current?.trigger(
  //         "ai",
  //         "editor.action.inlineSuggest.trigger",
  //         null
  //       );
  //     }, 50);
  //   }    
    

  //   // // Don't update if we're in the middle of accepting a suggestion
  //   // if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
  //   //   console.log("Skipping update - currently accepting/accepted suggestion")
  //   //   return
  //   // }

  //   // // Dispose previous provider
  //   // if (inlineCompletionProviderRef.current) {
  //   //   inlineCompletionProviderRef.current.dispose()
  //   //   inlineCompletionProviderRef.current = null
  //   // }

  //   // // Clear current suggestion reference
  //   // currentSuggestionRef.current = null

  //   // // Register new provider if we have a suggestion
  //   // if (suggestion && suggestionPosition) {
  //   //   console.log("Registering new inline completion provider")

  //   //   const language = getEditorLanguage(activeFile?.fileExtension || "")
  //   //   const provider = createInlineCompletionProvider(monaco)

  //   //   inlineCompletionProviderRef.current = monaco.languages.registerInlineCompletionsProvider(language, provider)

  //   //   // Small delay to ensure editor is ready, then trigger suggestions
  //   //   setTimeout(() => {
  //   //     if (editorRef.current && !isAcceptingSuggestionRef.current && !suggestionAcceptedRef.current) {
  //   //       console.log("Triggering inline suggestions")
  //   //       editor.trigger("ai", "editor.action.inlineSuggest.trigger", null)
  //   //     }
  //   //   }, 50)
  //   // }

  //   return () => {
  //     if (inlineCompletionProviderRef.current) {
  //       inlineCompletionProviderRef.current.dispose()
  //       inlineCompletionProviderRef.current = null
  //     }
  //   }
  // }, [suggestion, activeFile, createInlineCompletionProvider])


  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco
      // console.log("Editor instance mounted:", !!editorRef.current)

      configureMonaco(monaco)

      editor.updateOptions({
        ...defaultEditorOptions,
        // Enable inline suggestions but with specific settings to prevent conflicts
        inlineSuggest:{enabled: true},
        // Disable some conflicting suggest features
        suggest: {
          preview: false, // Disable preview to avoid conflicts
        },
        // Quick suggestions
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        // Smooth cursor
        cursorSmoothCaretAnimation: "on",
      })

      // Keyboard shortcuts
      // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      //   console.log("Ctrl+Space pressed, triggering suggestion")
      //   onTriggerSuggestion("completion", editor)
      // })

      // CRITICAL: Override Tab key with high priority and prevent default Monaco behavior
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose()
      }

      tabCommandRef.current = editor.addCommand(
        monaco.KeyCode.Tab,
        () => {
          // console.log("TAB PRESSED", {
          //   hasSuggestion: !!currentSuggestionRef.current,
          //   hasActiveSuggestion: hasActiveSuggestionAtPosition(),
          //   isAccepting: isAcceptingSuggestionRef.current,
          //   suggestionAccepted: suggestionAcceptedRef.current,
          // })

          
          if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
            editor.trigger("keyboard","tab",null)
            return
          }

         
          if (currentSuggestionRef.current) {
            const accepted = acceptCurrentSuggestion()
            if(accepted) return
          }

          // Default tab behavior (indentation)
          //console.log("DEFAULT: Using default tab behavior")
          editor.trigger("keyboard", "tab", null)
        },
        // CRITICAL: Use specific context to override Monaco's built-in Tab handling
        //"editorTextFocus && !editorReadonly && !suggestWidgetVisible",
      )

      // Escape to reject
      editor.addCommand(monaco.KeyCode.Escape, () => {
        //console.log("Escape pressed")
        if (currentSuggestionRef.current) {
          onRejectSuggestion(editor)
          clearCurrentSuggestion()
        }
      })

      // Listen for cursor position changes to hide suggestions when moving away
      editor.onDidChangeCursorPosition(() => {
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current);
        }

        if (
          !isAcceptingSuggestionRef.current &&
          !suggestionLoading &&
          !currentSuggestionRef.current
        ) {
          suggestionTimeoutRef.current = setTimeout(() => {
            onTriggerSuggestion("completion", editor);
          }, 300);
        }
      });     


      // Listen for content changes to detect manual typing over suggestions
      editor.onDidChangeModelContent((e: any) => {
        if (isAcceptingSuggestionRef.current) return

        if (
          currentSuggestionRef.current &&
          !suggestionAcceptedRef.current &&
          e.changes.length > 0
        ) {
          const change = e.changes[0]

          if (
            change.text === currentSuggestionRef.current.text ||
            change.text === currentSuggestionRef.current.text.replace(/\r/g, "")
          ) {
            return
          }

          clearCurrentSuggestion()
        }

        const triggers = ["\n", "{", ".", "=", "(", ",", ";", ":"]

        if (e.changes.length > 0 && triggers.includes(e.changes[0].text)) {
          setTimeout(() => {
            if (
              editorRef.current &&
              !currentSuggestionRef.current &&
              !suggestionLoading
            ) {
              onTriggerSuggestion("completion", editorRef.current)
            }
          }, 100)
        }
      })

    updateEditorLanguage()
  }

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    //const model = editorRef.current.getModel()
    //if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(editorRef.current.getModel(), language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
  }

  useEffect(() => {
    updateEditorLanguage()
  }, [activeFile])  

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose()
        //inlineCompletionProviderRef.current = null
      }
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose()
        //tabCommandRef.current = null
      }
    }
  }, [])

  return (
      <div className="h-full relative">
        {/* Loading indicator */}
        {suggestionLoading && (
          <div className="absolute top-2 right-2 z-10 bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            AI thinking...
          </div>
        )}

        {/* Active suggestion indicator */}
        {currentSuggestionRef.current && !suggestionLoading && (
          <div className="absolute top-2 right-2 z-10 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Press Tab to accept AI suggestion
          </div>
        )}

        <Editor
          height="100%"
          value={content}
          onChange={(value) => onContentChange(value || "")}
          onMount={handleEditorDidMount}
          language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}        
          options={defaultEditorOptions}
        />
      </div>
    )
  };

export default PlaygroundEditor