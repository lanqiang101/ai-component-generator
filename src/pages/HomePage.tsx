import React, { useEffect } from "react";
import { LeftFormPanel } from "../components/LeftFormPanel";
import { PreviewPanel } from "../components/PreviewPanel";
import { CodeEditorPanel } from "../components/CodeEditorPanel";
import { GenerateButton } from "../components/GenerateButton";
import { GenerationProgress } from "../components/GenerationProgress";
import { RequirementsRefinementDialog } from "../components/RequirementsRefinementDialog";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { useTranslation } from "../i18n";

export const HomePage: React.FC = () => {
  const {
    currentCode,
    generation,
    previewResolution,
    generatedFiles,
    activeFilePath,
    getMergedCode,
  } = useStore();
  const { t } = useTranslation();

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!generation.isGenerating) {
          useStore.getState().generateComponent();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generation.isGenerating]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)] min-h-0">
        {/* Left side: Form */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-5">
              <LeftFormPanel />
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
              <GenerateButton />
            </div>
          </Card>
        </div>

        {/* Right side: Preview + Code */}
        <div className="lg:col-span-8 flex flex-col min-h-0 gap-4">
          {/* Generation progress */}
          <GenerationProgress />

          {/* Top: Preview */}
          <div className="flex-1 min-h-[300px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.preview.title}
                </h3>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
                <PreviewPanel
                  code={
                    generatedFiles.length > 0 ? getMergedCode() : currentCode
                  }
                  resolution={previewResolution}
                />
              </div>
            </Card>
          </div>

          {/* Bottom: Code editor */}
          <div className="flex-1 min-h-[250px]">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.codeEditor.title}
                  {generatedFiles.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({activeFilePath})
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditorPanel />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Requirements refinement dialog */}
      <RequirementsRefinementDialog />
    </>
  );
};
