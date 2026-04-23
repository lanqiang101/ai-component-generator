import React, { useState, useMemo, useCallback } from "react";
import type { PreviewResolution } from "../types";
import { resolutionPresets } from "../constants/resolutions";
import { useStore } from "../store/useStore";
import { useTranslation } from '../i18n';
import { DeviceSelector } from './preview/DeviceSelector';
import { CodeTestArea } from './preview/CodeTestArea';
import { PreviewContainer } from './preview/PreviewContainer';
import { validateCode, generatePreviewHtml } from '../utils/previewUtils';

interface PreviewPanelProps {
  code: string;
  resolution: PreviewResolution;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  code,
  resolution,
}) => {
  const { setPreviewResolution } = useStore();
  const { t, language } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showTestArea, setShowTestArea] = useState<boolean>(false);

  // Validate code
  const validation = useMemo(() => {
    if (!code) return { valid: true };
    return validateCode(code);
  }, [code]);

  // Process iframe srcDoc
  const iframeHtml = useMemo(() => {
    return generatePreviewHtml(code, validation, language, t);
  }, [code, validation, language, t]);

  // iframe error handling
  const handleIframeError = useCallback(() => {
    setError("Unable to load preview, possible syntax error");
  }, []);

  // iframe load success - auto adjust height in adaptive mode
  const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    setError(null);
    
    const preset = resolutionPresets[resolution];
    const isAdaptive = preset.width === "100%";
    
    if (isAdaptive) {
      try {
        const iframe = e.currentTarget;
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc && iframeDoc.body) {
              const contentHeight = iframeDoc.body.scrollHeight;
              iframe.style.height = `${contentHeight + 20}px`;
            }
          } catch (err) {
            console.debug('Unable to adjust iframe height:', err);
          }
        }, 100);
      } catch (err) {
        console.debug('iframe load handling failed:', err);
      }
    }
  }, [resolution]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Top toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* Device selector */}
        <DeviceSelector
          resolution={resolution}
          onResolutionChange={setPreviewResolution}
          t={t}
          language={language}
        />
        
        {/* Code Test button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowTestArea(!showTestArea)}
            className="px-3 py-1.5 text-sm rounded-md border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-150 flex items-center gap-1"
            title={language === 'en' ? 'Paste code to test directly' : '粘贴代码直接测试渲染，无需走完整生成流程'}
          >
            <span>🧪</span>
            <span>{showTestArea ? t.preview.hideTest : t.preview.codeTest}</span>
          </button>
        </div>
        
        {/* Code paste test area */}
        {showTestArea && <CodeTestArea t={t} language={language} />}
      </div>

      {/* Preview container */}
      <PreviewContainer
        code={code}
        resolution={resolution}
        iframeHtml={iframeHtml}
        validation={validation}
        error={error}
        onIframeError={handleIframeError}
        onIframeLoad={handleIframeLoad}
        t={t}
        language={language}
      />
    </div>
  );
};
