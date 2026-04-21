
export type ModelMode = 'local' | 'api';

export interface ModelConfig {
  id: number;
  name: string;
  modelName: string;
  mode: ModelMode;
  apiKey?: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SystemConfig {
  id: number;
  componentGenerationModelId: number | null;
  createdAt: number;
  updatedAt: number;
}

export type Framework = 'react-tsx' | 'react-jsx' | 'vue3-sfc' | 'vue3-js' | 'html-css-js';
export type ComponentType = 'button' | 'card' | 'form' | 'navbar' | 'modal' | 'dropdown' | 'table' | 'chart' | 'other';
export type UIStyle = 'minimal' | 'neumorphism' | 'glassmorphism' | 'cyberpunk' | 'retro' | 'material' | 'antd';
export type StylePreprocessor = 'css' | 'scss' | 'less' | 'tailwind';

export interface ComponentGenerationParams {
  componentName: string;
  description: string;
  framework: Framework;
  componentType: ComponentType;
  style: UIStyle;
  dimensions: string;
  needMockData: boolean;
  interactive: boolean;
  uiLibrary: string;
  uiLibraryVersion: string;
  stylePreprocessor: StylePreprocessor;
  extraRequirements: string;
}

export type PreviewResolution = 
  | 'full'
  | 'iphone-se' | 'iphone-xr' | 'iphone-12-pro' | 'iphone-14-pro-max'
  | 'pixel-7' | 'pixel-7-pro'
  | 'galaxy-s8' | 'galaxy-s20-ultra' | 'galaxy-z-fold5' | 'galaxy-a51'
  | 'ipad-mini' | 'ipad-air' | 'ipad-pro'
  | 'surface-duo' | 'surface-pro7'
  | 'zenbook-fold'
  | 'nest-hub' | 'nest-hub-max'
  | 'laptop' | 'desktop';

export interface ResolutionPreset {
  key: PreviewResolution;
  label: string;
  width: number | '100%';
  height: number | '100%';
}

export interface GeneratedComponent {
  id: string;
  params: ComponentGenerationParams;
  code: string;
  createdAt: number;
  updatedAt: number;
}

// 需求整理结果
export interface RefinedRequirements {
  // 整理后的需求描述（更专业、结构化）
  refinedDescription: string;
  // 组件结构说明
  componentStructure: string;
  // 功能点列表（JSON 数组字符串）
  features: string;
  // 原型图（ASCII 格式）
  prototypeDiagram: string;
  // 技术要点（JSON 数组字符串）
  technicalNotes: string;
}

export type GenerationState = 
  | { isGenerating: true; error: string | null }
  | { isGenerating: false; error: string | null };

export interface AppState {
  // UI
  darkMode: boolean | 'auto';
  toggleDarkMode: () => void;
  
  // Models & Config
  models: ModelConfig[];
  systemConfig: SystemConfig | null;
  loadModels: () => void;
  loadSystemConfig: () => void;
  saveModels: () => void;
  saveSystemConfig: () => void;
  
  // Generation
  params: ComponentGenerationParams;
  setParams: (params: Partial<ComponentGenerationParams>) => void;
  resetParams: () => void;
  
  // Current result
  currentCode: string;
  setCurrentCode: (code: string) => void;
  
  // Preview
  previewResolution: PreviewResolution;
  setPreviewResolution: (res: PreviewResolution) => void;
  
  // Generation state
  generation: GenerationState;
  setGeneration: (state: Partial<GenerationState>) => void;
  generateComponent: () => Promise<boolean>;
  
  // Description expansion
  isExpandingDescription: boolean;
  setIsExpandingDescription: (isExpanding: boolean) => void;
  expandDescription: () => Promise<boolean>;
  
  // Requirements refinement
  isRefiningRequirements: boolean;
  refinedRequirements: RefinedRequirements | null;
  showRefinementDialog: boolean;
  refineRequirements: () => Promise<boolean>;
  confirmAndGenerate: () => Promise<boolean>;
  cancelRefinement: () => void;
}
