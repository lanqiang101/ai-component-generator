
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

export type PreviewResolution = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'full';

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

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

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
}
