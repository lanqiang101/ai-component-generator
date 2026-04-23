import React, { useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { resolutionPresets } from '../../constants/resolutions';
import type { PreviewResolution } from '../../types';

interface PreviewContainerProps {
  code: string;
  resolution: PreviewResolution;
  iframeHtml: string | null;
  validation: { valid: boolean; error?: string };
  error: string | null;
  onIframeError: () => void;
  onIframeLoad: (e: React.SyntheticEvent<HTMLIFrameElement>) => void;
  t: any;
  language: 'en' | 'zh';
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  code,
  resolution,
  iframeHtml,
  validation,
  error,
  onIframeError,
  onIframeLoad,
  t,
  language,
}) => {
  const preset = resolutionPresets[resolution];
  const isAdaptive = preset.width === "100%";

  const containerStyle: React.CSSProperties = {
    width: isAdaptive ? "100%" : `${preset.width}px`,
    height: "auto",
    minHeight: isAdaptive
      ? "400px"
      : preset.height === "100%"
        ? "100%"
        : `${preset.height}px`,
    maxHeight: isAdaptive ? "none" : "calc(100vh - 200px)",
    margin: "0 auto",
    background: "white",
    overflow: "visible",
  };

  if (!validation.valid) {
    return (
      <div className="flex-1 flex items-start justify-center bg-gray-100 dark:bg-slate-900/50 p-6 overflow-y-auto overflow-x-hidden">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  {t.preview.syntaxError}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {validation.error}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 border border-red-100 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <strong>{language === 'en' ? 'Tip:' : '提示：'}</strong>
                    {t.preview.errorHint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-start justify-center bg-gray-100 dark:bg-slate-900/50 p-6 overflow-y-auto overflow-x-hidden">
      <div
        style={containerStyle}
        className="shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white"
      >
        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">
              {error}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.preview.checkSyntax}
            </p>
          </div>
        ) : (
          iframeHtml && (
            <iframe
              srcDoc={iframeHtml}
              title="component-preview"
              className="w-full border-0 rounded-lg bg-white"
              style={{ minHeight: "inherit" }}
              onError={onIframeError}
              onLoad={onIframeLoad}
            />
          )
        )}
      </div>
    </div>
  );
};
