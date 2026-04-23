
import React from 'react';
import { useStore } from '../store/useStore';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Switch } from '@radix-ui/react-switch';
import { Sparkles, Loader2 } from 'lucide-react';
import { getUILibrariesForFramework, getVersionsForUILibrary } from '../constants/ui-libraries';
import { useTranslation } from '../i18n';

export const LeftFormPanel: React.FC = () => {
  const { params, setParams } = useStore();
  const { t } = useTranslation();

  const updateField = (field: keyof typeof params, value: any) => {
    setParams({ [field]: value });
  };

  const availableUILibraries = getUILibrariesForFramework(params.framework);
  const availableVersions = getVersionsForUILibrary(params.uiLibrary);

  // Reset version when UI Library changes
  const handleUILibraryChange = (value: string) => {
    const versions = getVersionsForUILibrary(value);
    updateField('uiLibrary', value);
    updateField('uiLibraryVersion', versions.length > 0 ? versions[0] : '');
  };

  return (
    <div className="space-y-6">
      {/* Component Name */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="componentName" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
            {t.form.componentName}
          </Label>
          <Input
            id="componentName"
            placeholder={t.form.componentNamePlaceholder}
            value={params.componentName}
            onChange={(e) => updateField('componentName', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Component Description */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t.form.componentDescription}
            </Label>
            <button
              onClick={() => useStore.getState().expandDescription()}
              disabled={useStore.getState().isExpandingDescription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {useStore.getState().isExpandingDescription ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t.form.expanding}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{t.form.aiExpand}</span>
                </>
              )}
            </button>
          </div>
          <Textarea
            id="description"
            placeholder={t.form.descriptionPlaceholder}
            rows={5}
            value={params.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.form.expandTip}
          </p>
        </div>
      </div>

      {/* 编程语言/框架 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="framework" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.framework}
          </Label>
          <select
            id="framework"
            value={params.framework}
            onChange={(e) => updateField('framework', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {[
              { value: 'react-tsx', label: 'React 18 + TypeScript (TSX)' },
              { value: 'react-jsx', label: 'React 18 + JavaScript (JSX)' },
              { value: 'vue3-sfc', label: 'Vue 3 + TypeScript (.vue)' },
              { value: 'vue3-js', label: 'Vue 3 + JavaScript (.vue)' },
              { value: 'html-css-js', label: 'Plain HTML + CSS + JavaScript' },
            ].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Component Type */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="componentType" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.componentType}
          </Label>
          <select
            id="componentType"
            value={params.componentType}
            onChange={(e) => updateField('componentType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {[
              { value: 'button', label: t.form.button },
              { value: 'card', label: t.form.card },
              { value: 'form', label: t.form.form },
              { value: 'navbar', label: t.form.navbar },
              { value: 'modal', label: t.form.modal },
              { value: 'dropdown', label: t.form.dropdown },
              { value: 'table', label: t.form.table },
              { value: 'chart', label: t.form.chart },
              { value: 'other', label: t.form.other },
            ].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* UI 风格 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="style" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.uiStyle}
          </Label>
          <select
            id="style"
            value={params.style}
            onChange={(e) => updateField('style', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {[
              { value: 'minimal', label: t.form.minimal },
              { value: 'neumorphism', label: t.form.neumorphism },
              { value: 'glassmorphism', label: t.form.glassmorphism },
              { value: 'cyberpunk', label: t.form.cyberpunk },
              { value: 'retro', label: t.form.retro },
              { value: 'material', label: t.form.material },
              { value: 'antd', label: t.form.antd },
            ].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 尺寸规格 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.dimensions}
          </Label>
          <Input
            id="dimensions"
            placeholder={t.form.dimensionsPlaceholder}
            value={params.dimensions}
            onChange={(e) => updateField('dimensions', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.form.dimensionsTip}</p>
        </div>
      </div>

      {/* 需要 Mock 数据 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Label htmlFor="needMockData" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.needMockData}
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              id="needMockData"
              checked={params.needMockData}
              onCheckedChange={(checked) => updateField('needMockData', checked)}
              className="data-[state=checked]:bg-blue-600 w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <span
                className={`data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 block w-4 h-4 bg-white rounded-full transition-transform shadow-sm`}
                data-state={params.needMockData ? 'checked' : 'unchecked'}
              />
            </Switch>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {params.needMockData ? t.form.on : t.form.off}
            </span>
          </div>
        </div>
      </div>

      {/* 可交互 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Label htmlFor="interactive" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.needInteraction}
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              id="interactive"
              checked={params.interactive}
              onCheckedChange={(checked) => updateField('interactive', checked)}
              className="data-[state=checked]:bg-blue-600 w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <span
                className={`data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 block w-4 h-4 bg-white rounded-full transition-transform shadow-sm`}
                data-state={params.interactive ? 'checked' : 'unchecked'}
              />
            </Switch>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {params.interactive ? t.form.on : t.form.off}
            </span>
          </div>
        </div>
      </div>

      {/* UI 库 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="uiLibrary" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.uiLibrary}
          </Label>
          <select
            id="uiLibrary"
            value={params.uiLibrary}
            onChange={(e) => handleUILibraryChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {availableUILibraries.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.form.uiLibraryTip}</p>
        </div>
      </div>

      {/* UI 库版本 - 只在有版本选项时显示 */}
      {availableVersions.length > 0 && (
        <div className="group">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
            <Label htmlFor="uiLibraryVersion" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t.form.uiLibraryVersion}
            </Label>
            <select
              id="uiLibraryVersion"
              value={params.uiLibraryVersion}
              onChange={(e) => updateField('uiLibraryVersion', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">Please select version</option>
              {availableVersions.map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 样式预处理 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="stylePreprocessor" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.stylePreprocessor}
          </Label>
          <select
            id="stylePreprocessor"
            value={params.stylePreprocessor}
            onChange={(e) => updateField('stylePreprocessor', e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {[
              { value: 'css', label: t.form.css },
              { value: 'scss', label: t.form.scss },
              { value: 'less', label: t.form.less },
              { value: 'tailwind', label: t.form.tailwind },
            ].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="extraRequirements" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t.form.extraRequirements}
          </Label>
          <Textarea
            id="extraRequirements"
            placeholder={t.form.extraRequirementsPlaceholder}
            rows={3}
            value={params.extraRequirements}
            onChange={(e) => updateField('extraRequirements', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
