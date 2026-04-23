
export type Language = 'en' | 'zh';

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

// Requirements refinement result
export interface RefinedRequirements {
  // Refined requirement description (more professional, structured)
  refinedDescription: string;
  // Component structure description
  componentStructure: string;
  // Feature list (JSON array string)
  features: string;
  // Prototype diagram (ASCII format)
  prototypeDiagram: string;
  // Technical notes (JSON array string)
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
  
  // ====== 多文件组件化生成相关 ======
  // 当前生成任务
  generationTaskId: string | null;
  generationTask: GenerationTask | null;
  generatedFiles: GeneratedFile[];
  activeFilePath: string;
  generationProgress: number;
  
  // 多文件生成方法
  startMultiFileGeneration: (params: ComponentGenerationParams) => Promise<string>;
  pollGenerationProgress: () => void;
  setActiveFile: (path: string) => void;
  getMergedCode: () => string;
  cancelMultiFileGeneration: () => void;
  // 加载生成的文件列表
  loadGeneratedFiles: (taskId: string) => Promise<void>;
}

// ====== 多文件组件化生成相关类型 ======

// 生成文件状态
export type FileStatus = 'pending' | 'generating' | 'completed' | 'failed';

// 生成任务状态
export type TaskStatus = 'analyzing' | 'scaffolding' | 'filling' | 'assembling' | 'completed' | 'failed';

// 组件复杂度
export type ComponentComplexity = 'simple' | 'medium' | 'complex';

// 生成文件定义
export interface GeneratedFile {
  path: string;           // 文件路径,如 "components/ProductImage.tsx"
  name: string;           // 文件名,如 "ProductImage.tsx"
  code: string;           // 文件内容
  status: FileStatus;     // 生成状态
  size?: number;          // 文件大小(字符数)
  generatedAt?: Date;     // 生成时间
}

// 子组件设计
export interface SubComponentDesign {
  id: string;
  name: string;
  filePath: string;       // 文件路径
  purpose: string;        // 职责描述
  props: string[];        // Props 列表
  state?: string[];       // 内部状态
  estimatedLines: number; // 预估行数
  priority: number;       // 生成优先级(越小越先生成)
}

// 工具函数设计
export interface UtilityFunctionDesign {
  name: string;
  filePath: string;
  purpose: string;
  exports: string[];      // 导出的函数名
}

// 组件架构设计
export interface ComponentArchitecture {
  componentName: string;
  description: string;
  complexity: ComponentComplexity;
  generationMode: 'single-file' | 'multi-file'; // 生成模式
  
  // 单文件模式
  singleFileEstimate?: number; // 预估行数
  
  // 多文件模式
  subComponents?: SubComponentDesign[];
  utilityFunctions?: UtilityFunctionDesign[];
  mainComponent?: {
    filePath: string;
    dependencies: string[];   // 依赖的子组件名
    estimatedLines: number;
  };
  
  totalFiles: number;         // 总文件数
  estimatedTotalLines: number; // 预估总行数
}

// 生成任务
export interface GenerationTask {
  id: string;
  status: TaskStatus;
  currentStep: number;      // 当前步骤索引
  totalSteps: number;       // 总步骤数
  progress: number;         // 进度百分比 (0-100)
  
  params: ComponentGenerationParams;
  architecture?: ComponentArchitecture;
  files: GeneratedFile[];
  
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

// 文件树分组结果
export interface GroupedFiles {
  [directory: string]: GeneratedFile[];
}
