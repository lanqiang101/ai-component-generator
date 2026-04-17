
import React from 'react';
import { useStore } from '../store/useStore';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Switch } from '@radix-ui/react-switch';
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
    <div className="spacey-6 space-y-6">
      {/* 组件名称 */}
      <div className="space-y-2">
        <Label htmlFor="componentName">组件名称</Label>
        <Input
          id="componentName"
          placeholder="比如：登录表单、商品卡片"
          value={params.componentName}
          onChange={(e) => updateField('componentName', e.target.value)}
        />
      </div>

      {/* 组件描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">组件描述</Label>
        <Textarea
          id="description"
          placeholder="详细描述这个组件的功能..."
          rows={3}
          value={params.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      {/* 编程语言/框架 */}
      <div className="space-y-2">
        <Label htmlFor="framework">编程语言 / 框架</Label>
        <select
          id="framework"
          value={params.framework}
          onChange={(e) => updateField('framework', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {frameworkOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 组件类型 */}
      <div className="space-y-2">
        <Label htmlFor="componentType">组件类型</Label>
        <select
          id="componentType"
          value={params.componentType}
          onChange={(e) => updateField('componentType', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {componentTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* UI 风格 */}
      <div className="space-y-2">
        <Label htmlFor="style">UI 设计风格</Label>
        <select
          id="style"
          value={params.style}
          onChange={(e) => updateField('style', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {styleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 尺寸规格 */}
      <div className="space-y-2">
        <Label htmlFor="dimensions">尺寸规格</Label>
        <Input
          id="dimensions"
          placeholder="比如：宽度 100%，高度 48px"
          value={params.dimensions}
          onChange={(e) => updateField('dimensions', e.target.value)}
        />
        <p className="text-xs text-gray-500">描述组件预期尺寸，留空则自适应</p>
      </div>

      {/* 需要 Mock 数据 */}
      <div className="flex items-center justify-between">
        <Label htmlFor="needMockData">需要默认 Mock 数据</Label>
        <div className="flex items-center gap-3">
          <Switch
            id="needMockData"
            checked={params.needMockData}
            onCheckedChange={(checked) => updateField('needMockData', checked)}
            className="data-[state=checked]:bg-primary w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
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

      {/* 可交互 */}
      <div className="flex items-center justify-between">
        <Label htmlFor="interactive">需要交互事件</Label>
        <div className="flex items-center gap-3">
          <Switch
            id="interactive"
            checked={params.interactive}
            onCheckedChange={(checked) => updateField('interactive', checked)}
            className="data-[state=checked]:bg-primary w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
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

      {/* UI 库 */}
      <div className="space-y-2">
        <Label htmlFor="uiLibrary">UI 组件库</Label>
        <select
          id="uiLibrary"
          value={params.uiLibrary}
          onChange={(e) => handleUILibraryChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {availableUILibraries.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">根据所选框架自动过滤可用选项</p>
      </div>

      {/* UI 库版本 - 只在有版本选项时显示 */}
      {availableVersions.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="uiLibraryVersion">UI 库版本</Label>
          <select
            id="uiLibraryVersion"
            value={params.uiLibraryVersion}
            onChange={(e) => updateField('uiLibraryVersion', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="">请选择版本</option>
            {availableVersions.map(version => (
              <option key={version} value={version}>{version}</option>
            ))}
          </select>
        </div>
      )}

      {/* 样式预处理 */}
      <div className="space-y-2">
        <Label htmlFor="stylePreprocessor">样式预处理</Label>
        <select
          id="stylePreprocessor"
          value={params.stylePreprocessor}
          onChange={(e) => updateField('stylePreprocessor', e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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

      {/* 额外需求 */}
      <div className="space-y-2">
        <Label htmlFor="extraRequirements">额外需求</Label>
        <Textarea
          id="extraRequirements"
          placeholder="任何其他需求或特殊要求..."
          rows={3}
          value={params.extraRequirements}
          onChange={(e) => updateField('extraRequirements', e.target.value)}
        />
      </div>
    </div>
  );
};
