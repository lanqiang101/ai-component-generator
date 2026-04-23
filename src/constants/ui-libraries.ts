
import type { Framework } from '../types';

export interface UILibraryOption {
  value: string;
  label: string;
  defaultVersions: string[];
}

// UI library version configuration
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

// Return available UI library options based on framework
export const getUILibrariesForFramework = (framework: Framework): UILibraryOption[] => {
  // React frameworks
  if (framework.startsWith('react')) {
    return [
      { value: 'none', label: 'None (Native)', defaultVersions: [] },
      { value: 'antd', label: 'Ant Design', defaultVersions: ['5.x', '4.x'] },
      { value: 'material-ui', label: 'Material UI', defaultVersions: ['v5 (MUI)', 'v4'] },
      { value: 'chakra-ui', label: 'Chakra UI', defaultVersions: ['v2', 'v1'] },
      { value: 'mantine', label: 'Mantine', defaultVersions: ['v7', 'v6'] },
      { value: 'shadcn-ui', label: 'Shadcn UI', defaultVersions: ['latest'] },
    ];
  }

  // Vue frameworks
  if (framework.startsWith('vue')) {
    return [
      { value: 'none', label: 'None (Native)', defaultVersions: [] },
      { value: 'element-plus', label: 'Element Plus', defaultVersions: ['v2.x'] },
      { value: 'antd-vue', label: 'Ant Design Vue', defaultVersions: ['v4.x', 'v3.x'] },
      { value: 'vuetify', label: 'Vuetify', defaultVersions: ['v3.x', 'v2.x'] },
      { value: 'naive-ui', label: 'Naive UI', defaultVersions: ['v2.x'] },
    ];
  }

  // HTML native
  return [
    { value: 'none', label: 'None (Native)', defaultVersions: [] },
    { value: 'bootstrap', label: 'Bootstrap', defaultVersions: ['v5', 'v4'] },
    { value: 'tailwind', label: 'Tailwind CSS', defaultVersions: ['v3.x', 'v2.x'] },
  ];
};

// Get version list for specified UI library
export const getVersionsForUILibrary = (uiLibrary: string): string[] => {
  return uiLibraryVersions[uiLibrary] || [];
};

// Style preprocessor options
export const stylePreprocessorOptions = [
  { value: 'css', label: 'Native CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
  { value: 'tailwind', label: 'Tailwind CSS' },
];