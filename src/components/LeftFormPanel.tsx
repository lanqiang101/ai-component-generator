
import React from 'react';
import { useStore } from '../store/useStore';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Switch } from '@radix-ui/react-switch';
import { Sparkles, Loader2 } from 'lucide-react';
import { getUILibrariesForFramework, getVersionsForUILibrary } from '../constants/ui-libraries';

const frameworkOptions = [
  { value: 'react-tsx', label: 'React 18 + TypeScript (TSX)' },
  { value: 'react-jsx', label: 'React 18 + JavaScript (JSX)' },
  { value: 'vue3-sfc', label: 'Vue 3 + TypeScript (.vue)' },
  { value: 'vue3-js', label: 'Vue 3 + JavaScript (.vue)' },
  { value: 'html-css-js', label: '纯 HTML + CSS + JavaScript' },
];

const componentTypeOptions = [
  { value: 'button', label: '按钮' },
  { value: 'card', label: '卡片' },
  { value: 'form', label: '表单' },
  { value: 'navbar', label: '导航栏' },
  { value: 'modal', label: '模态框' },
  { value: 'dropdown', label: '下拉菜单' },
  { value: 'table', label: '表格' },
  { value: 'chart', label: '图表' },
  { value: 'other', label: '其他自定义' },
];

const styleOptions = [
  { value: 'minimal', label: '简约现代' },
  { value: 'neumorphism', label: '新拟物化 Neumorphism' },
  { value: 'glassmorphism', label: '玻璃拟态 Glassmorphism' },
  { value: 'cyberpunk', label: '赛博朋克' },
  { value: 'retro', label: '复古' },
  { value: 'material', label: 'Material Design' },
  { value: 'antd', label: 'Ant Design 风格' },
];

export const LeftFormPanel: React.FC = () => {
  const { params, setParams } = useStore();

  const updateField = (field: keyof typeof params, value: any) => {
    setParams({ [field]: value });
  };

  const availableUILibraries = getUILibrariesForFramework(params.framework);
  const availableVersions = getVersionsForUILibrary(params.uiLibrary);

  // 当UI库改变时，重置版本
  const handleUILibraryChange = (value: string) => {
    const versions = getVersionsForUILibrary(value);
    updateField('uiLibrary', value);
    updateField('uiLibraryVersion', versions.length > 0 ? versions[0] : '');
  };

  return (
    <div className="space-y-6">
      {/* 组件名称 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="componentName" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
            组件名称
          </Label>
          <Input
            id="componentName"
            placeholder="比如：登录表单、商品卡片"
            value={params.componentName}
            onChange={(e) => updateField('componentName', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 组件描述 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              组件描述
            </Label>
            <button
              onClick={() => useStore.getState().expandDescription()}
              disabled={useStore.getState().isExpandingDescription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {useStore.getState().isExpandingDescription ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>扩写中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>AI 扩写</span>
                </>
              )}
            </button>
          </div>
          <Textarea
            id="description"
            placeholder="详细描述这个组件的功能，点击 AI 扩写让描述更专业..."
            rows={5}
            value={params.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            简短描述后点击"AI 扩写"让 AI 帮你完善描述
          </p>
        </div>
      </div>

      {/* 编程语言/框架 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="framework" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            编程语言 / 框架
          </Label>
          <select
            id="framework"
            value={params.framework}
            onChange={(e) => updateField('framework', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {frameworkOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 组件类型 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="componentType" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            组件类型
          </Label>
          <select
            id="componentType"
            value={params.componentType}
            onChange={(e) => updateField('componentType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {componentTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* UI 风格 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="style" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            UI 设计风格
          </Label>
          <select
            id="style"
            value={params.style}
            onChange={(e) => updateField('style', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {styleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 尺寸规格 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            尺寸规格
          </Label>
          <Input
            id="dimensions"
            placeholder="比如：宽度 100%，高度 48px"
            value={params.dimensions}
            onChange={(e) => updateField('dimensions', e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">描述组件预期尺寸，留空则自适应</p>
        </div>
      </div>

      {/* 需要 Mock 数据 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Label htmlFor="needMockData" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            需要默认 Mock 数据
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
              {params.needMockData ? '开启' : '关闭'}
            </span>
          </div>
        </div>
      </div>

      {/* 可交互 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Label htmlFor="interactive" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            需要交互事件
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
              {params.interactive ? '开启' : '关闭'}
            </span>
          </div>
        </div>
      </div>

      {/* UI 库 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="uiLibrary" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            UI 组件库
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
          <p className="text-xs text-gray-500 dark:text-gray-400">根据所选框架自动过滤可用选项</p>
        </div>
      </div>

      {/* UI 库版本 - 只在有版本选项时显示 */}
      {availableVersions.length > 0 && (
        <div className="group">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
            <Label htmlFor="uiLibraryVersion" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              UI 库版本
            </Label>
            <select
              id="uiLibraryVersion"
              value={params.uiLibraryVersion}
              onChange={(e) => updateField('uiLibraryVersion', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">请选择版本</option>
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
            样式预处理
          </Label>
          <select
            id="stylePreprocessor"
            value={params.stylePreprocessor}
            onChange={(e) => updateField('stylePreprocessor', e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {[
              { value: 'css', label: '原生 CSS' },
              { value: 'scss', label: 'SCSS' },
              { value: 'less', label: 'LESS' },
              { value: 'tailwind', label: 'Tailwind CSS' },
            ].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 额外需求 */}
      <div className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
          <Label htmlFor="extraRequirements" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            额外需求
          </Label>
          <Textarea
            id="extraRequirements"
            placeholder="任何其他需求或特殊要求..."
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
