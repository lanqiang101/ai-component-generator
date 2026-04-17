
import type { Framework } from '../types';

export interface UILibraryOption {
  value: string;
  label: string;
  defaultVersions: string[];
}

// UI库版本配置
const uiLibraryVersions: Record<string, string[]> = {
  none: [],
  antd: ['5.x', '4.x'],
  'material-ui': ['v5 (MUI)', 'v4'],
  'chakra-ui': ['v2', 'v1'],
  mantine: ['v7', 'v6'],
  'shadcn-ui': ['latest'],
  'element-plus': ['v2.x'],
  'antd-vue': ['v4.x', 'v3.x'],
  vuetify: ['v3.x', 'v2.x'],
  'naive-ui': ['v2.x'],
  bootstrap: ['v5', 'v4'],
  tailwind: ['v3.x', 'v2.x'],
};

// 根据框架返回可用的UI库选项
export const getUILibrariesForFramework = (framework: Framework): UILibraryOption[] => {
  // React 框架
  if (framework.startsWith('react')) {
    return [
      { value: 'none', label: '不使用（原生）', defaultVersions: [] },
      { value: 'antd', label: 'Ant Design', defaultVersions: ['5.x', '4.x'] },
      { value: 'material-ui', label: 'Material UI', defaultVersions: ['v5 (MUI)', 'v4'] },
      { value: 'chakra-ui', label: 'Chakra UI', defaultVersions: ['v2', 'v1'] },
      { value: 'mantine', label: 'Mantine', defaultVersions: ['v7', 'v6'] },
      { value: 'shadcn-ui', label: 'Shadcn UI', defaultVersions: ['latest'] },
    ];
  }

  // Vue 框架
  if (framework.startsWith('vue')) {
    return [
      { value: 'none', label: '不使用（原生）', defaultVersions: [] },
      { value: 'element-plus', label: 'Element Plus', defaultVersions: ['v2.x'] },
      { value: 'antd-vue', label: 'Ant Design Vue', defaultVersions: ['v4.x', 'v3.x'] },
      { value: 'vuetify', label: 'Vuetify', defaultVersions: ['v3.x', 'v2.x'] },
      { value: 'naive-ui', label: 'Naive UI', defaultVersions: ['v2.x'] },
    ];
  }

  // HTML 纯原生
  return [
    { value: 'none', label: '不使用（原生）', defaultVersions: [] },
    { value: 'bootstrap', label: 'Bootstrap', defaultVersions: ['v5', 'v4'] },
    { value: 'tailwind', label: 'Tailwind CSS', defaultVersions: ['v3.x', 'v2.x'] },
  ];
};

// 获取指定UI库的版本列表
export const getVersionsForUILibrary = (uiLibrary: string): string[] => {
  return uiLibraryVersions[uiLibrary] || [];
};

// 样式预处理选项
export const stylePreprocessorOptions = [
  { value: 'css', label: '原生 CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
  { value: 'tailwind', label: 'Tailwind CSS' },
];
